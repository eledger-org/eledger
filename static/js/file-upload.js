function set_body_height() {
	var wh = $(window).height();

	$('#overlay-image').attr('style', 'height:' + wh + 'px;');
}

$(document).ready(function() {
	set_body_height();

	$(window).bind('resize', function() { set_body_height(); });

	$('#container').click(function() {
		$('#overlay-image').hide();
	});

	$('.display-image-button').click(function() {
		$.ajax({
			url: "/api/get-file/" + $(this).attr('filename'),
			async: true,
			success: function(responseText) {
				$('#overlay-image').attr("src", responseText);
				$('#overlay-image').zIndex = 255;
				$('#overlay-image').show();
			}
		});
	});
});

