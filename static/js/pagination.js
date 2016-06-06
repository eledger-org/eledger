var pLimit  = pagination._limit;
var pCount  = pagination._count;
var pOffset = pagination._offset;

if (pLimit !== undefined) {
  pLimit = parseInt(pLimit);
} else {
  pLimit = undefined;
}

if (pCount !== undefined) {
  pCount = parseInt(pCount);
} else {
  pCount = undefined;
}

if (pOffset !== undefined) {
  pOffset = parseInt(pOffset);
} else {
  pOffset = undefined;
}

function pageBeg() {
  return {"offset": NaN};
}

function pageNext() {
  var newOffset = 0;

  newOffset = pOffset + pLimit;

  if (newOffset > pCount) {
    return {"offset": pOffset};
  } else {
    return {"offset": newOffset};
  }
}

function pagePrev() {
  var newOffset = NaN;

  newOffset = pOffset - pLimit;

  if (newOffset <= 0) {
    newOffset = NaN;
  }

  return {"offset": newOffset};
}

function pageEnd() {
  return page(pagination._pages.length);
}

function page(pageNumber) {
  if (!isNaN(pageNumber) && pageNumber > 1) {
    return {"offset": (pageNumber - 1) * pLimit};
  } else {
    return {"offset": NaN};
  }
}

$(document).ready(function() {
  $('a.pagination-beg') .attr("href", buildLink(window.location.pathname, pageBeg()));
  $('a.pagination-prev').attr("href", buildLink(window.location.pathname, pagePrev()));
  $('a.pagination-next').attr("href", buildLink(window.location.pathname, pageNext()));
  $('a.pagination-end') .attr("href", buildLink(window.location.pathname, pageEnd()));

  if (pOffset <= 0) {
    $('a.pagination-beg') .parent().addClass('disabled');
    $('a.pagination-prev').parent().addClass('disabled');
  }

  if (pOffset >= pCount - pLimit) {
    $('a.pagination-next').parent().addClass('disabled');
    $('a.pagination-end').parent().addClass('disabled');
  }

  $('a.pagination-num') .each(function() {
    $(this).attr("href", buildLink(window.location.pathname, page($(this).attr("pageNumber"))));
  });
});
