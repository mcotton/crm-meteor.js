Posts = new Meteor.Collection('posts');

if (Meteor.isClient) {
    Template.posts.helpers({
        posts: function() {
            return Posts.find();
        }
    })
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
