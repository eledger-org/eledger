function buildLink(path, parameters) {
  var url = window.location.pathname;

  parameters = $.extend(true, {}, getParams(), parameters);

  for (parameter in parameters) {
    if (parameters[parameter] === undefined) {
      console.log("Tried to build a new link with additional parameter %s, but it was undefined", parameter);

      delete parameters[parameter];
    } else if (typeof parameters[parameter] === "number" && isNaN(parameters[parameter])) {
      console.log("Tried to build a new link with additional parameter %s, but it was NaN", parameter);

      delete parameters[parameter];
    }
  }

  if (Object.keys(parameters).length > 0) {
    url += "?" + $.param(parameters);
  }

  return url;
}

function getParams() {
  var params = {};
  var pairs = document.URL.split('?').pop().split('&');
  var pair;

  for (var i = 0; i < pairs.length; ++i) {
    pair = pairs[i].split('=');

    params[pair[0]] = pair[1];
  }

  return params;
}

function reloadWithAdditionalParameters(parameters) {
  for (parameter in parameters) {
    if (isNaN(parameters[parameter])) {
      console.log("Tried to reload with additional parameter %s, but it was NaN", parameter);

      delete parameters[parameter];
    }
  }

  console.log($.param(parameters));
  console.log(window.location.pathname);
  if (Object.keys(parameters).length > 0) {
    window.location.href = window.location.pathname + "?" + $.param(parameters);
  } else {
    window.location.href = window.location.pathname;
  }
}

