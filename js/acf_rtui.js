/*!
 * Textarea and select clone() bug workaround | Spencer Tipping
 * Licensed under the terms of the MIT source code license
 */
!(function (e) {
  jQuery.fn.clone = function () {
    for (
      var t = e.apply(this, arguments),
        a = this.find("textarea").add(this.filter("textarea")),
        n = t.find("textarea").add(t.filter("textarea")),
        r = this.find("select").add(this.filter("select")),
        l = t.find("select").add(t.filter("select")),
        d = 0,
        i = a.length;
      i > d;
      ++d
    )
      jQuery(n[d]).val(jQuery(a[d]).val())
    for (var d = 0, i = r.length; i > d; ++d)
      l[d].selectedIndex = r[d].selectedIndex
    return t
  }
})(jQuery.fn.clone)

/*
 * ACF Repeater Tabs | James Park Ninja
 * Licensed under the terms of the MIT source code license
 */

;(function () {
  this.jpnuniqid = function (pr, en) {
    var pr = pr || "",
      en = en || false,
      result

    this.seed = function (s, w) {
      s = parseInt(s, 10).toString(16)
      return w < s.length
        ? s.slice(s.length - w)
        : w > s.length
        ? new Array(1 + (w - s.length)).join("0") + s
        : s
    }

    result =
      pr +
      this.seed(parseInt(new Date().getTime() / 1000, 10), 8) +
      this.seed(Math.floor(Math.random() * 0x75bcd15) + 1, 5)

    if (en) result += (Math.random() * 10).toFixed(8).toString()

    return result
  }
})()

function escapeRegExp(str) {
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&")
}

var debounceTimeout
function debounce(func, wait, immediate) {
  return function () {
    var context = this,
      args = arguments
    var later = function () {
      debounceTimeout = null
      if (!immediate) func.apply(context, args)
    }
    var callNow = immediate && !debounceTimeout
    clearTimeout(debounceTimeout)
    debounceTimeout = setTimeout(later, wait)
    if (callNow) func.apply(context, args)
  }
}

;(function ($) {
  $.fn.jpnChangeElementType = function (newType) {
    var attrs = {}

    $.each(this[0].attributes, function (idx, attr) {
      attrs[attr.nodeName] = attr.nodeValue
    })

    this.replaceWith(function () {
      return $("<" + newType + "/>", attrs).append($(this).contents())
    })
  }
})(jQuery)

jQuery(document).ready(function ($) {
  var TabbedRepeaters = {
    init: function () {
      TabbedRepeaters.initVars()
      if (!TabbedRepeaters.shouldRun()) return
      TabbedRepeaters.cacheElements()
      TabbedRepeaters.attachEventListeners()

      // TODO -- should we check for acf or other test?
      acf.add_action("ready", function ($el) {
        TabbedRepeaters.setupTabs()
        TabbedRepeaters.adminUIFixes()
      })
    },

    adminUIFixes: function () {
      // labels with no content should not have margin
      $(".acf-field .acf-label").each(function () {
        if ($.trim($(this).html()) == "") {
          $(this).css({ margin: 0 })
        }
      })

      // repeaters with no label should use the full block space
      $(".rtui-activated").each(function () {
        var container = $(this).closest(".acf-field-repeater")

        // must be only child  -- dropped for now
        // if (container.siblings().length > 0) return

        // and have no label text
        if ($.trim(container.find(" > .acf-label").html()) != "") return

        container.css({ padding: 0 })
        $(this).css({ border: 0 })

        if ($(this).hasClass("rtui-horizontal")) {
          // remove some double borders
          container.find(".acf-table").first().css({ marginLeft: "-1px" })
          container.find(".rtui-tabs").first().css({
            marginTop: "-1px",
            borderLeft: "0",
            borderRight: "0",
          })
        }
      })

      // this doesn't work because nested repeaters are not visible
      // so have no width to calculate padding
      // we should work on moving the button instead

      // standardise Remove & Dupe buttons with Add
      $(
        '.rtui-activated > .rtui-tabs > .acf-actions [data-event="add-row"]'
      ).each(function () {
        var label = $(this).html().replace("Add ", "")
        // width is used to position the remove button inline
        var addBtnWidth = $(this).outerWidth()

        // cache elements
        var container = $(this).closest(".rtui-activated")
        var actions = container.find("> .rtui-tabs > .acf-actions")
        var handle = container.find(
          "> .acf-repeater > .acf-table > tbody > .acf-row > .acf-row-handle"
        )

        // use the same label as Add button
        handle.find("> .-minus, > .-duplicate").each(function () {
          var title = $(this).attr("title").replace("row", label)
          $(this).attr("title", title)
        })

        // update the rtui-remove-btn label
        actions.find(".rtui-remove-btn").each(function () {
          var title = $(this).text().replace("row", label)
          $(this).text(title)
        })
      })
    },

    initVars: function () {
      TabbedRepeaters.confirm_delete = false
      TabbedRepeaters.clss = ".rtui-activated"
      TabbedRepeaters.repeaters = []
    },

    cacheElements: function () {
      TabbedRepeaters.$container = $(TabbedRepeaters.clss)
    },

    shouldRun: function () {
      return $(TabbedRepeaters.clss + " > .acf-repeater").length > 0
    },

    attachEventListeners: function () {
      var events = [["sortstop", ".rtui-sortable", TabbedRepeaters.handleSort]]

      events.map(function (event) {
        $(document).on(event[0], event[1], event[2])
      })

      acf.addAction("append", function ($el) {
        TabbedRepeaters.refreshSortables()

        // was this a repeater row that was added?
        if (!$el.hasClass("acf-row")) return

        // was this append on a repeater that we care about?
        if (!TabbedRepeaters.isTabbedComponent($el)) return

        // find the position of the new panel and generate a tab
        var idx = TabbedRepeaters.findPanelIndex($el)

        TabbedRepeaters.generateTab($el, idx)
        TabbedRepeaters.activateThisPanel($el)
      })

      acf.addAction("remove", function ($el) {
        // activate the last panel
        // this logic could be made better if we track the last active
        // panel and then move to the one after
        // but thats not an mvp function

        // find the $field from the matching tab
        var id = $el.attr("data-rtui-id")
        var $tab = $(".rtui-tab[data-rtui-id='" + id + "']")
        if (!$tab.length) {
          // the tab doesn't exist
          // e.g. we are in a nested non-tabbed repeater
          return
        }
        var $field = $tab.closest(".rtui-activated")
        var $panels = TabbedRepeaters.getPanels($field, $el)

        // remove the old tab
        $tab.remove()

        // activate the last panel
        TabbedRepeaters.activateThisPanel($panels.last())
      })
    },

    setupTabs: function () {
      $(".rtui-activated").each(function () {
        TabbedRepeaters.generateTabs($(this))
        TabbedRepeaters.relocateAddNewButton($(this))
        TabbedRepeaters.addRemoveButton($(this))
        // TabbedRepeaters.makeSortable($(this))
      })
      TabbedRepeaters.refreshSortables()
    },

    // moves the add button into the tab bar
    relocateAddNewButton: function ($field) {
      var actions = $field.find("> .acf-repeater > .acf-actions")
      var bar = $field.find("> .rtui-tabs")
      bar.append(actions)
    },

    // add the remove button into actions
    addRemoveButton: function ($field) {
      var $tabs = $field.find("> .rtui-tabs")
      var $actions = $tabs.find("> .acf-actions")

      var btn = $("<button></button>", {
        html: "Remove row",
        class: "button rtui-remove-btn",
      })
      btn.click(function (e) {
        e.preventDefault()
        // find the remove button
        var removeBtn = TabbedRepeaters.findActiveRowRemove($field)

        // if we have no rows then there isnt a button
        if (!removeBtn) return

        // move it to this btn centre
        var btnCentre = $(this).outerWidth() / 2
        var containerWidth = $tabs.outerWidth()
        var btnRight = containerWidth - $(this).position().left - btnCentre - 10

        if ($field.hasClass("rtui-vertical")) {
          removeBtn.css({
            right: "calc( 125% - 10px - 0.5em - " + btnCentre + "px )",
          })
        } else {
          removeBtn.css({ right: btnRight + "px " })
        }

        // click it
        removeBtn.trigger("click")
      })
      $actions.prepend(btn)
    },

    findActiveRowRemove: function ($field) {
      return $field.find(
        "> .acf-repeater > .acf-table > tbody > .acf-row.active > .acf-row-handle > .-minus"
      )
    },

    // ensures that all tabs are sortable
    refreshSortables: function () {
      $(".rtui-nav").each(function () {
        if ($(this).hasClass("ui-sortable")) {
          $(this).sortable("destroy")
        }
        // add a class for the sortstop handler to target
        $(this).addClass("rtui-sortable").sortable({ cancel: "" })
      })
    },

    // finds the field that an element belongs to
    getField: function ($el) {
      return $el.closest(".rtui-activated")
    },

    // checks if the element is part of a tabbed repeater
    // e.g. if we're in a sub-repeater that isn't tabbed we
    // want to get false
    isTabbedComponent: function ($el) {
      $repeater = $el.closest(".acf-repeater")
      return $repeater.parent().hasClass("rtui-activated")
    },

    // should this include some recursion for newly
    // added nested repeaters?
    // -- probably not, could we trigger that on_add?
    getPanels: function ($field, $exclude = null) {
      var $panels = $field
        .find(".acf-table")
        .first()
        .find("> tbody > .acf-row:not(.acf-clone)")
      if ($exclude) {
        // exclusion is used because this set can contain
        // a panel which is being deleted
        $panels = $panels.filter(function () {
          return $(this).attr("data-rtui-id") != $exclude.attr("data-rtui-id")
        })
      }
      return $panels
    },

    // returns the dom element where panels should be inserted
    getPanelsContainer($field) {
      return $field.find(".acf-table").first().find("> tbody")
    },

    activatePanel: function (id) {
      var panel = $('.acf-row:not(.acf-clone)[data-rtui-id="' + id + '"]')
      if (panel.length) {
        panel.siblings().removeClass("active")
        panel.addClass("active")
      }

      // activate the button too
      TabbedRepeaters.activateButton(id)
    },

    activateButton: function (id) {
      var btn = $('.rtui-tab[data-rtui-id="' + id + '"]')
      if (btn.length) {
        btn.siblings().removeClass("active")
        btn.addClass("active")
      }
    },

    // takes a panel and activates it
    activateThisPanel: function ($panel) {
      var id = $panel.attr("data-rtui-id")
      TabbedRepeaters.activatePanel(id)
    },

    // returns or creates the nav container which houses the nav
    // and action buttons
    getNavContainer: function ($field) {
      var $container = $field.find("> .rtui-tabs")
      if (!$container.length) {
        $container = $('<div class="rtui-tabs"></div>')
        $field.prepend($container)
      }
      return $container
    },

    getNav: function ($field) {
      var $container = TabbedRepeaters.getNavContainer($field)
      var $nav = $container.find("> .rtui-nav")
      if (!$nav.length) {
        var $nav = $('<div class="rtui-nav nav"></div>')
        $container.append($nav)
      }
      return $nav
    },

    // find the index of a panel in its repeater group
    findPanelIndex: function ($panel) {
      return $panel.parent().find("> *").index($panel)
    },

    // generates a tab and links it to a panel
    generateTab: function ($panel, idx = null, $field = null) {
      // grab the field if we dont have it
      if (!$field) {
        $field = TabbedRepeaters.getField($panel)
      }

      var $nav = TabbedRepeaters.getNav($field)

      var label = idx + 1

      // should we check that tab doesnt already have id?
      var id = jpnuniqid("repeater_")
      // tag with an id
      $panel.attr("data-rtui-id", id)

      // create a matching tab
      var btn = $("<button class='rtui-tab'></button>")

      // if we have a collapsed field use that to update the button label
      // collapsed label val
      var cField = $panel.find(".-collapsed-target input[type='text']")
      if (cField) {
        // if field has value use that as label
        if (cField.val()) {
          label = cField.val()
        }

        // regenerate the label whenever the field changes val
        cField.keyup(function () {
          btn.text(this.value)
        })
      }

      // attach id to btn
      btn
        .attr("data-rtui-id", id)
        // set the label
        .text(label)
        // onClick activate the tab
        .on("click", function (e) {
          e.preventDefault()
          TabbedRepeaters.activatePanel(id)
        })

      // add button to nav
      $nav.append(btn)
    },

    generateTabs: function ($field) {
      var $nav = TabbedRepeaters.getNav($field)
      // loop through panels
      var panels = TabbedRepeaters.getPanels($field)
      panels.each(function (idx) {
        TabbedRepeaters.generateTab($(this), idx, $field)
      })

      // start with the first panel active
      TabbedRepeaters.activateThisPanel(panels.first())
    },

    handleSort: function (event, ui) {
      // grab ids in new tab order
      var ids = []
      var $target = $(event.target)
      $target.children().each(function () {
        ids.push($(this).attr("data-rtui-id"))
      })

      var $field = TabbedRepeaters.getField($target)
      // build an ordered array of panels matching the id order
      var sortedPanels = []

      $.each(ids, function (i, id) {
        var $panel = $(".acf-row[data-rtui-id='" + id + "']")
        sortedPanels.push($panel)
      })

      var $container = TabbedRepeaters.getPanelsContainer($field)
      // prepend to leave the clone field intact
      $container.prepend(sortedPanels)
    },
  }

  TabbedRepeaters.init()
})
