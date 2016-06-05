function reloadWithAdditionalParameters(parameters) {
  console.log($.param(parameters));
  console.log(window.location.pathname);
  window.location.href = window.location.pathname + "?" + $.param(parameters);
}
