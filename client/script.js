$(document).ready(function() {

  $('.nav-header').click(function(e) { $('.' + $(this).attr('data-class')).toggle() } )

  $(".timeago").timeago();

});
