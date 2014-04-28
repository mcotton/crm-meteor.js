Customers = new Meteor.Collection('customers');
History = new Meteor.Collection('history');

Meteor.methods({
  'addNewCustomer': function(custName) {
    return Customers.insert({ 'name': custName })
  },
  'addCustomerUpdate': function(custID, custUpdate) {
    var result = History.insert({ 'custID': custID,
                                  'custUpdate': custUpdate,
                                  'custDate': [new Date().toDateString(), new Date().toLocaleTimeString()].join(' ')})
    console.log('result:', result)
    return result
  }
})

if (Meteor.isClient) {
    Template.customers.helpers({
        listCustomers: function() {
            if(Meteor.user() && Meteor.user().emails[0] && Meteor.user().emails[0].address) {
                var domain = Meteor.user().emails[0].address.split('@')[1]
                // sort results by name
                return _.sortBy(Customers.find({'domain': 'eagleeyenetworks.com'}).fetch(), function(item) { return item.name });
            }
        }
    })

    Template.customers.events({
      'click .btn': function(event) {
        if($('#inputCustomerName').val().length > 0) {
          Meteor.call('addNewCustomer', $('#inputCustomerName').val())
          $('#inputCustomerName').val('')
        }
      },
      'click a': function(event) {
        Session.set('selectedCustomer', $(event.currentTarget).data('id'))
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
          console.log('result:', result)
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
        //console.log('data-id:', $(event.currentTarget).data('id'))
        //debugger
        Meteor.call('addCustomerUpdate', $(event.currentTarget).data('id'), $('#inputCustomerUpdate').val())
        $('#inputCustomerUpdate').val('')
      }
    })
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
