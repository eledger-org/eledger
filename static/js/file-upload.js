function set_body_height() {
  var ww = $(window).width();
  var wh = $(window).height();

  $('#overlay-image').attr('style', 'height:' + wh + 'px;');
}

$(document).ready(function() {
  $('#overlay-tint').hide();
  set_body_height();

  $(window).bind('resize', function() { set_body_height(); });

  $('#overlay-tint').click(function() {
    $('#overlay-image').hide();
    $('#overlay-tint').hide();
  });

  $('.display-image-button').click(function() {
    $.ajax({
      url: "/api/get-file/" + $(this).attr('filename'),
      async: true,
      success: function(responseText) {
        $('#overlay-tint').attr("src", responseText);
        $('#overlay-tint').zIndex = 254;
        $('#overlay-tint').show();
        $('#overlay-image').attr("src", responseText);
        $('#overlay-image').zIndex = 255;
        $('#overlay-image').show();
      }
    });
  });
});

