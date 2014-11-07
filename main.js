Customers = new Meteor.Collection('customers');
History = new Meteor.Collection('history');

Meteor.methods({
  'addNewCustomer': function(custName, domain) {
    // check that there isn't already a customer named that
    var query = Customers.findOne({'name': custName, 'domain': domain})
    if(query === undefined) {
      query = Customers.insert({ 'name': custName, 'domain': domain})
    }
    return query
  },
  'addCustomerUpdate': function(custID, custUpdate, domain) {
    return History.insert({ 'custID': custID,
                            'custUpdate': custUpdate,
                            'domain': domain || 'eagleeyenetworks.com',
                            'custDate': new Date().toISOString()})
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
        last25Updates: function() {
          if(Meteor.user() && Meteor.user().emails[0] && Meteor.user().emails[0].address) {
            var domain = Meteor.user().emails[0].address.split('@')[1]
            // sort results by date, desc

            return _.first(_.sortBy(
              _.uniq(History.find({'domain': domain},{sort: {'custDate': 1}}).fetch())
              , function(item) { return new Date(item.custDate) }).reverse(), 25)
          }
        }
    })

    Template.customers.events({
      'click .btn': function(event) {
        if($('#inputCustomerName').val().length > 0) {
          if(Meteor.user() && Meteor.user().emails[0] && Meteor.user().emails[0].address) {
            var domain = Meteor.user().emails[0].address.split('@')[1]
            Meteor.call('addNewCustomer', $('#inputCustomerName').val(), domain, function(err, ret) {
              Session.set('selectedCustomer', ret)
            })
            $('#inputCustomerName').val('')
          }
        }
      },
      'click a': function(event) {
        Session.set('selectedCustomer', $(event.currentTarget).attr('data-id'))
      },
      'click .remove': function(event) {
        if(confirm('Are you sure you want to delete this?')) {
          Customers.remove({'_id': $(event.currentTarget).attr('data-id')})
        }
      },
      'mouseover .customers': function(event) {
        $(event.currentTarget).find('.remove').css('visibility', 'visible')
      },
      'mouseout .customers': function(event) {
        $(event.currentTarget).find('.remove').css('visibility', 'hidden')
      }
    })

    Template.history.helpers({
      showDetail: function() {
        var result = Customers.findOne(Session.get('selectedCustomer'));
        if(result) {
          Session.set('selectedCustomerName', result.name)
          Session.set('selectedCustomerLastItem', result.lastItem)
          var history = History.find({'custID': Session.get('selectedCustomer') }).fetch()
          history.forEach(function(item) { item.custDate = new Date(item.custDate).toLocaleString() })
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

    Template.listItemHistory.rendered = function() {
      setTimeout( function() {
        $(".timeago").timeago();
      }, 1000);
    }

    Template.listItemCustomer.rendered = function() {
      setTimeout( function() {
        $(".timeago").timeago();
      }, 1000);
    }

    Template.history.events({
      'click .btn': function(event) {
        var result = Meteor.call('addCustomerUpdate',
                                    $(event.currentTarget).attr('data-id'),
                                    $('#inputCustomerUpdate').val())
        Session.set('selectedCustomer', result)
        $('#inputCustomerUpdate').val('')
      },
      'click .edit': function(event) {

      },
      'click .remove': function(event) {
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
