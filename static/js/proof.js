var canvas = $('#proofing-canvas');
var context = undefined;

console.log(readings);
try {
  window.dataJson = JSON.parse(readings[0].dataJson);

  console.log(window.dataJson);
} catch (ex) {
  console.log("Unable to parse dataJson");
}

/** TODO Move this logic to some database based templating setup so that users can control templates **/
var proofingInputTemplates = {
  "receipt": [
    "Category",
    "Vendor",
    "Zip",
    "Date",
    "Subtotal",
    "Tax",
    "Tip",
    "Total",
    "VendorID",
    "CCLast4"
  ]
};

var proofingInputTemplatesGenerators = {
  Category: categoryTemplateGenerator,
  Vendor: defaultTemplateGenerator,
  Zip: defaultTemplateGenerator,
  Date: defaultTemplateGenerator,
  Subtotal: defaultTemplateGenerator,
  Tax: defaultTemplateGenerator,
  Tip: defaultTemplateGenerator,
  Total: defaultTemplateGenerator,
  VendorID: defaultTemplateGenerator,
  CCLast4: defaultTemplateGenerator
};

if (canvas !== undefined &&
    canvas[0] !== undefined) {
  var context = canvas[0].getContext('2d');
}

function defaultTemplateGenerator(parentElement, thisId) {
  var vendorInputDiv = parentElement.append(
    '<div class="row form-group">' +
      '<label class="form-control-label col-sm-4" for="' + thisId + '">' + thisId + ':</label>' +
      '<div class="col-sm-8">' +
        '<input class="form-control col-sm-8" id="' + thisId + '">' +
      '</div>' +
    '</div>');

  vendorInputDiv.find('#' + thisId).change(save);
}

function categoryTemplateGenerator(parentElement, thisId) {
  var expenseCategories = getExpenseCategories();
  var expenseSubcategories = getExpenseSubcategories();

  var categories = parentElement.append(
    '<div class="row form-group">' +
      '<label class="form-control-label col-sm-4" for="' + thisId + '">' + thisId + ':</label>' +
      '<div class="col-sm-8 select2-container form-select select2">' +
        '<select class="form-control select2 select2-offscreen"></select>' +
      '</div>' +
    '</div>'
  );

  var selectElement = categories.find('select').first();
  var optgroups = "";
  var category = "";
  var subcategory = "";

  for (ec = 0; ec < expenseCategories.length; ++ec) {
    category = expenseCategories[ec];

    optgroups += '<optgroup id="' + category + '" label="' + category + '">';

    if (expenseSubcategories[category] === undefined) {
      console.log("Missing subcategory definition for category");
    } else {
      for (esc = 0; esc < expenseSubcategories[category].length; ++esc) {
        subcategory = expenseSubcategories[category][esc];

        optgroups += '<option value="' + category + "|" + subcategory + '">' + subcategory + '</option>';
      }
    }

    optgroups += '</optgroup>';
  };

  selectElement.append(optgroups);
  selectElement.prop('selectedIndex', -1);

  selectElement.attr('id', thisId);

  /** Breaks things **/
  //categories.find('.select2-container').first().addClass('form-control');
  //categories.find('.selection').first().addClass('form-control');
  //categories.find('span').first().addClass('form-control');

  /** Does nothing **/
  //categories.find('input').first().addClass('form-control');
  //categories.find('.select2-selection').first().addClass('form-control');
  //categories.find('.presentation').first().addClass('form-control');
}

/** TODO Source categories from a dynamic list based on common usage from the api **/
function getExpenseCategories() {
    return [
      "Auto", "Clothing", "Education", "Financial", "Food",
      "Gifts", "Healthcare", "Hobbies", "Home", "Insurance",
      "Job", "Pets", "Recreation", "Tax Payment", "Utilities", "Vacation"
    ];
}

function getExpenseSubcategories() {
  return {
    "Auto": [ "Fuel", "Maintenance", "Fees", "Payment" ],
    "Clothing": [ "Personal", "Professional" ],
    "Education": [ "Tuition", "Books", "School Supplies", "Field Trips", "Fees", "Student Loans Payment" ],
    "Financial": [ "Annual Fee", "Interest Payment", "Late Fee", "Monthly Payment", "Other Fee" ],
    "Food": [ "Dining", "Groceries" ],
    "Gifts": [ "Birthday", "Wedding", "Baby", "Anniversary" ],
    "Healthcare": [ "Medical", "Dental", "Vision", "Prescription", "Over the Counter", "Emergency Care" ],
    "Hobbies": [ "Gaming", "Maker" ],
    "Home": [ "Rent", "Mortgage", "Homeowner's Association", "Furniture", "Decorating", "Tools", "Home Repair", "Home Improvement" ],
    "Insurance": [ "Auto", "Health", "Life", "Disability", "Long Term Care", "Roadside Assistance", "Pet" ],
    "Job": [ "Reimbursed", "Professional/Career" ],
    "Pets": [ "Food", "Supplies", "Vet" ],
    "Recreation": [ "Movies" ],
    "Tax Payment": [ "Local", "State", "Federal" ],
    "Utilities": [ "Water", "Sewer", "Electricity", "Gas", "Television", "Phone", "Internet", "Solid Waste" ],
    "Vacation": [ "Auto", "Lodging", "Entertainment", "Adventure" ]
  };
}

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
    .height(proofingInputHeight);

  $('#proofing-viewport').height(proofingViewportHeight);

  $('#proofing-canvas')
    .attr('height', proofingViewportHeight - 3)
    .attr('width',  $('#proofing-viewport').width());
}

set_body_height();
set_body_height();

$(window).bind('resize', function() { set_body_height(); });

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

function suppressSaving() {
  window.savingSuppressed = true;
}

function resumeSaving() {
  window.savingSuppressed = false;
}

function save() {
  if (window.savingSuppressed === true) {
    console.log("Saving was suppressed.");

    return false;
  }

  var messageData = {
    selection: window.proofingImageSelection,
    inputs: {}
  };

  $.each($('#proofing-input select'), function(index, value) {
    messageData.inputs[$(this).attr('id')] = $(this).val();
  });

  $.each($('#proofing-input input'), function(index, value) {
    messageData.inputs[$(this).attr('id')] = $(this).val();
  });

  console.log(messageData);

  $.ajax({
    type: 'PUT',
    url: "/api/proofs/" + $('#proofing-canvas').attr('linked-id'),
    async: true,
    data: JSON.stringify(messageData),
    dataType: "json",
    contentType: "application/json",
    success: function(responseText) {
    }
  });
}

function applyLoadedSelection() {
  setSelection(null, getSelection());

  cropControlClick();
}

function getSelection() {
  if (window.dataJson === undefined) {
    return undefined;
  }

  return window.dataJson.selection;
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

  // In theory, I'd like to stretch the image more intelligently in the future
  var mockImage = {width: scaledImageWidth, height: scaledImageHeight};

  var h1 = scaledImageHeight;
  var h2 = canvas.height();
  var w1 = scaledImageWidth;
  var w2 = canvas.width();

  if (w1 / h1 > w2 / h2) {
    h2 = h2 / ((w1 / h1) / (w2 / h2));
  } else {
    w2 = w2 * ((w1 / h1) / (w2 / h2));
  }

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
      w2,
      h2);

  canvas.imgAreaSelect({remove: true});

  image.cropped = true;
}

$(document).ready(function() {
  canvas = $('#proofing-canvas');
  context = canvas[0].getContext('2d');

  $('#header-controls').children('a').each(function() {
    $(this).click(function() {
      generateProofingInputs($(this).attr('id'));
    });
  });

  $.ajax({
    url: "/api/get-file/" + $('#proofing-canvas').attr('filename'),
    async: true,
    success: function(responseText) {
      canvas  = $('#proofing-canvas');
      context = canvas[0].getContext('2d');

      image = new Image();
      image.src = responseText;

      canvas.imgAreaSelect({onSelectEnd: setSelection });

      image.onload = function() {
        if (getSelection()) {
          applyLoadedSelection();
        } else {
          resetCanvas();
        }
      };

      window.proofingImage = image;

      canvas.click(function() {
        if (image.cropped === true) {
          resetCanvas();
        }
      });

      $('#crop-control').click(function() {
        cropControlClick();

        save();
      });
    }
  });

  suppressSaving();

  /** TODO detect the last recorded file type and use that **/
  /** TODO 2 If can't detect (i.e. never visited before) assume user.defaultType or something **/
  generateProofingInputs("receipt");

  if (window.dataJson !== undefined) {
    $.each(window.dataJson.inputs, function(key, value) {
      $('#' + key).val(value).change();
    });
  }

  resumeSaving();
});

function cropControlClick() {
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
}

function generateProofingInputs(inputId) {
  if (proofingInputTemplates[inputId] === undefined) {
    console.log("No match for %s", inputId);
    return;
  }

  var inputDiv = $('#proofing-input');

  for (i = 0; i < proofingInputTemplates[inputId].length; ++i) {
    var fieldName = proofingInputTemplates[inputId][i];
    var callback = proofingInputTemplatesGenerators[fieldName];
    if (callback) {
      callback(inputDiv, fieldName);
    }
          /*
  "Vendor": function(parentElement) {
    var vendorInputDiv = parentElement.add('div');

    var vendorInputLabel = vendorInputDiv.add('label').attr('for', 'Vendor').val('Vendor:');
    var vendorInput = vendorInputDiv.add('input').id('Vendor');
    }
    */
  }
}

