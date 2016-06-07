function set_body_height() {
  var controlHeight           = $('#crop-control').outerHeight(true);
  var windowWidth             = $(window).width();
  var windowHeight            = $(window).height();

  var proofingInputWidth      = $('#proofing-input-container').css('width');
  var proofingInputHeight     = windowHeight - (2 * controlHeight);
  var proofingViewportWidth   = $('#proofing-viewport').width();
  var proofingViewportHeight  = windowHeight - controlHeight;

  $('.controls').attr('height', controlHeight);

  $('#proofing-input-container')
    .height(proofingInputHeight);

  $('#proofing-input')
    .height(proofingInputHeight)
    .width(proofingInputWidth);

  $('#proofing-viewport').height(proofingViewportHeight);

  $('#proofing-canvas')
    .attr('height', proofingViewportHeight - 3)
    .attr('width',  $('#proofing-viewport').width());

/*
  $('#proofing-viewport')
    .attr('height', windowHeight - controlHeight - 10)
    .attr('style', "background-color: black");

  $('#proofing-input')
    .attr('height', windowHeight - (2 * controlHeight))
    .attr('style', "background-color: black");
  */
}

function setSelection(img, _selection) {
  window.proofingImageSelection = _selection;
}

function getScalingFactor(image, canvas) {
  var scaledWidth  = image.width * (canvas.height() / image.height);
  var scaledHeight = image.height * (canvas.width() / image.width);

  if (scaledWidth > canvas.width()) {
    return scaledHeight / image.height;
  } else {
    return scaledWidth / image.width;
  }
}

function save() {
  var messageData = JSON.stringify({selection: window.proofingImageSelection});

  console.log(messageData);

  $.ajax({
    type: 'PUT',
    url: "/api/proofs/" + $('#proofing-canvas').attr('linked-id'),
    async: true,
    data: messageData,
    dataType: "json",
    contentType: "application/json",
    success: function(responseText) {
    }
  });
}

function resetCanvas() {
  var canvas  = $('#proofing-canvas');
  var context = canvas[0].getContext('2d');

  canvas.imgAreaSelect({onSelectEnd: setSelection });

  image.cropped = false;

  delete window.proofingImageSelection;

  var scale = getScalingFactor(image, canvas);
  context.clearRect(0, 0, canvas.width(), canvas.height());
  context.drawImage(image, 0, 0, scale * image.width, scale * image.height);
}

function drawScaledImage(image, canvas, context, selection) {
  var scale = getScalingFactor(image, canvas);

  context.clearRect(0, 0, canvas.width(), canvas.height());

  var scaledImageWidth  = (selection.x2 - selection.x1) / scale;
  var scaledImageHeight = (selection.y2 - selection.y1) / scale;

  /*
  // In theory, I'd like to stretch the image more intelligently in the future
  var mockImage = {width: scaledImageWidth, height: scaledImageHeight};
  var newScale = getScalingFactor(mockImage, canvas);
  */

  var scaledImageLeft   = selection.x1 / scale;
  var scaledImageTop    = selection.y1 / scale;

  context.drawImage(
      image,
      scaledImageLeft,
      scaledImageTop,
      scaledImageWidth,
      scaledImageHeight,
      0,
      0,
      canvas.width(),
      canvas.height());

  canvas.imgAreaSelect({remove: true});

  image.cropped = true;

  save();
}

set_body_height();
set_body_height();

$(window).bind('resize', function() { set_body_height(); });

$(document).ready(function() {
  $.ajax({
    url: "/api/get-file/" + $('#proofing-canvas').attr('filename'),
    async: true,
    success: function(responseText) {
      var canvas  = $('#proofing-canvas');
      var context = canvas[0].getContext('2d');

      image = new Image();
      image.src = responseText;

      canvas.imgAreaSelect({onSelectEnd: setSelection });

      image.onload = function() {
        resetCanvas();
      };

      window.proofingImage = image;

      canvas.click(function() {
        if (image.cropped === true) {
          resetCanvas();
        }
      });

      $('#crop-control').click(function() {
        if (image.cropped === true) {
          resetCanvas();
        } else if (window.proofingImageSelection !== undefined) {
          drawScaledImage(image, canvas, context, window.proofingImageSelection);

          return;
          var selection = window.proofingImageSelection;
          var scale = getScalingFactor(image, canvas);

          context.clearRect(0, 0, canvas.width(), canvas.height());
          context.drawImage(image,
              selection.x1 / scale,
              selection.y1 / scale,
              (selection.x2 - selection.x1) / scale,
              (selection.y2 - selection.y1) / scale,
              0, 0, canvas.width(), canvas.height());

          canvas.imgAreaSelect({remove: true});

          image.cropped = true;
        }
      });
    }
  });
});

