Customers = new Meteor.Collection('customers');
History = new Meteor.Collection('history');

Meteor.methods({
  'addNewCustomer': function(custName, domain) {
    return Customers.insert({ 'name': custName, 'domain': domain})
  },
  'addCustomerUpdate': function(custID, custUpdate, domain) {
    var result = History.insert({ 'custID': custID,
                                  'custUpdate': custUpdate,
                                  'domain': domain,
                                  'custDate': [new Date().toDateString(), new Date().toLocaleTimeString()].join(' ')})
    //console.log('result:', result)
    return result
  }
})

if (Meteor.isClient) {
    Template.customers.helpers({
        listCustomers: function() {
            if(Meteor.user() && Meteor.user().emails[0] && Meteor.user().emails[0].address) {
              var domain = Meteor.user().emails[0].address.split('@')[1]
              // sort results by name
              return _.sortBy(
                Customers.find({'domain': domain}).fetch()
                , function(item) { return item.name });
            }
        },
        last10Updates: function() {
          if(Meteor.user() && Meteor.user().emails[0] && Meteor.user().emails[0].address) {
            var domain = Meteor.user().emails[0].address.split('@')[1]
            // sort results by date, desc
            return _.sortBy(
              _.uniq(History.find({},{sort: {'custDate': -1}, limit: 10}).fetch())
              , function(item) { return -item.custDate });
          }
        }
    })

    Template.customers.events({
      'click .btn': function(event) {
        if($('#inputCustomerName').val().length > 0) {
          if(Meteor.user() && Meteor.user().emails[0] && Meteor.user().emails[0].address) {
            var domain = Meteor.user().emails[0].address.split('@')[1]
            Meteor.call('addNewCustomer', $('#inputCustomerName').val(), domain)
            $('#inputCustomerName').val('')
          }
        }
      },
      'click a': function(event) {
        Session.set('selectedCustomer', $(event.currentTarget).attr('data-id'))
      }
    })

    Template.history.helpers({
      showDetail: function() {
        var result = Customers.findOne(Session.get('selectedCustomer'));
        if(result) {
          Session.set('selectedCustomerName', result.name)
          Session.set('selectedCustomerLastItem', result.lastItem)
          var history = History.find({'custID': Session.get('selectedCustomer') }).fetch()
          result.history = history
          return result
        }
        return null
      },
      showName: function() {
        var result = Customers.findOne(Session.get('selectedCustomer'));
        if(result) {
          Session.set('selectedCustomerName', result.name)
          Session.set('selectedCustomerLastItem', result.lastItem)
          return result
        }
        return {'name': '', 'lastItem': ''}
      }
    })

    Template.history.events({
      'click .btn': function(event) {
        //console.log('data-id:', $(event.currentTarget).attr('data-id'))
        //debugger
        Meteor.call('addCustomerUpdate', $(event.currentTarget).attr('data-id'), $('#inputCustomerUpdate').val())
        $('#inputCustomerUpdate').val('')
      },
      'click .edit': function(event) {
        //console.log('data-id:', $(event.currentTarget).attr('data-id'))
        //debugger
        //History.remove({'_id': $(event.currentTarget).attr('data-id')})
      },
      'click .remove': function(event) {
        //console.log('data-id:', $(event.currentTarget).attr('data-id'))
        //debugger
        if(confirm('Are you sure you want to delete this?')) {
          History.remove({'_id': $(event.currentTarget).attr('data-id')})
        }
      }
    })
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
