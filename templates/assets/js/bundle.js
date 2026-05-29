
/* === hoverIntent.min.js === */
/*! This file is auto-generated */
!function(I){I.fn.hoverIntent=function(e,t,n){function r(e){o=e.pageX,v=e.pageY}var o,v,i,u,s={interval:100,sensitivity:6,timeout:0},s="object"==typeof e?I.extend(s,e):I.isFunction(t)?I.extend(s,{over:e,out:t,selector:n}):I.extend(s,{over:e,out:e,selector:t}),h=function(e,t){if(t.hoverIntent_t=clearTimeout(t.hoverIntent_t),Math.sqrt((i-o)*(i-o)+(u-v)*(u-v))<s.sensitivity)return I(t).off("mousemove.hoverIntent",r),t.hoverIntent_s=!0,s.over.apply(t,[e]);i=o,u=v,t.hoverIntent_t=setTimeout(function(){h(e,t)},s.interval)},t=function(e){var n=I.extend({},e),o=this;o.hoverIntent_t&&(o.hoverIntent_t=clearTimeout(o.hoverIntent_t)),"mouseenter"===e.type?(i=n.pageX,u=n.pageY,I(o).on("mousemove.hoverIntent",r),o.hoverIntent_s||(o.hoverIntent_t=setTimeout(function(){h(n,o)},s.interval))):(I(o).off("mousemove.hoverIntent",r),o.hoverIntent_s&&(o.hoverIntent_t=setTimeout(function(){var e,t;e=n,(t=o).hoverIntent_t=clearTimeout(t.hoverIntent_t),t.hoverIntent_s=!1,s.out.apply(t,[e])},s.timeout)))};return this.on({"mouseenter.hoverIntent":t,"mouseleave.hoverIntent":t},s.selector)}}(jQuery);

/* === jquery.mobile.custom.min.js === */
/*! jQuery Mobile v1.4.5 | Copyright 2010, 2014 jQuery Foundation, Inc. | jquery.org/license */

(function(e,t,n){typeof define=="function"&&define.amd?define(["jquery"],function(r){return n(r,e,t),r.mobile}):n(e.jQuery,e,t)})(this,document,function(e,t,n,r){(function(e,t,n,r){function T(e){while(e&&typeof e.originalEvent!="undefined")e=e.originalEvent;return e}function N(t,n){var i=t.type,s,o,a,l,c,h,p,d,v;t=e.Event(t),t.type=n,s=t.originalEvent,o=e.event.props,i.search(/^(mouse|click)/)>-1&&(o=f);if(s)for(p=o.length,l;p;)l=o[--p],t[l]=s[l];i.search(/mouse(down|up)|click/)>-1&&!t.which&&(t.which=1);if(i.search(/^touch/)!==-1){a=T(s),i=a.touches,c=a.changedTouches,h=i&&i.length?i[0]:c&&c.length?c[0]:r;if(h)for(d=0,v=u.length;d<v;d++)l=u[d],t[l]=h[l]}return t}function C(t){var n={},r,s;while(t){r=e.data(t,i);for(s in r)r[s]&&(n[s]=n.hasVirtualBinding=!0);t=t.parentNode}return n}function k(t,n){var r;while(t){r=e.data(t,i);if(r&&(!n||r[n]))return t;t=t.parentNode}return null}function L(){g=!1}function A(){g=!0}function O(){E=0,v.length=0,m=!1,A()}function M(){L()}function _(){D(),c=setTimeout(function(){c=0,O()},e.vmouse.resetTimerDuration)}function D(){c&&(clearTimeout(c),c=0)}function P(t,n,r){var i;if(r&&r[t]||!r&&k(n.target,t))i=N(n,t),e(n.target).trigger(i);return i}function H(t){var n=e.data(t.target,s),r;!m&&(!E||E!==n)&&(r=P("v"+t.type,t),r&&(r.isDefaultPrevented()&&t.preventDefault(),r.isPropagationStopped()&&t.stopPropagation(),r.isImmediatePropagationStopped()&&t.stopImmediatePropagation()))}function B(t){var n=T(t).touches,r,i,o;n&&n.length===1&&(r=t.target,i=C(r),i.hasVirtualBinding&&(E=w++,e.data(r,s,E),D(),M(),d=!1,o=T(t).touches[0],h=o.pageX,p=o.pageY,P("vmouseover",t,i),P("vmousedown",t,i)))}function j(e){if(g)return;d||P("vmousecancel",e,C(e.target)),d=!0,_()}function F(t){if(g)return;var n=T(t).touches[0],r=d,i=e.vmouse.moveDistanceThreshold,s=C(t.target);d=d||Math.abs(n.pageX-h)>i||Math.abs(n.pageY-p)>i,d&&!r&&P("vmousecancel",t,s),P("vmousemove",t,s),_()}function I(e){if(g)return;A();var t=C(e.target),n,r;P("vmouseup",e,t),d||(n=P("vclick",e,t),n&&n.isDefaultPrevented()&&(r=T(e).changedTouches[0],v.push({touchID:E,x:r.clientX,y:r.clientY}),m=!0)),P("vmouseout",e,t),d=!1,_()}function q(t){var n=e.data(t,i),r;if(n)for(r in n)if(n[r])return!0;return!1}function R(){}function U(t){var n=t.substr(1);return{setup:function(){q(this)||e.data(this,i,{});var r=e.data(this,i);r[t]=!0,l[t]=(l[t]||0)+1,l[t]===1&&b.bind(n,H),e(this).bind(n,R),y&&(l.touchstart=(l.touchstart||0)+1,l.touchstart===1&&b.bind("touchstart",B).bind("touchend",I).bind("touchmove",F).bind("scroll",j))},teardown:function(){--l[t],l[t]||b.unbind(n,H),y&&(--l.touchstart,l.touchstart||b.unbind("touchstart",B).unbind("touchmove",F).unbind("touchend",I).unbind("scroll",j));var r=e(this),s=e.data(this,i);s&&(s[t]=!1),r.unbind(n,R),q(this)||r.removeData(i)}}}var i="virtualMouseBindings",s="virtualTouchID",o="vmouseover vmousedown vmousemove vmouseup vclick vmouseout vmousecancel".split(" "),u="clientX clientY pageX pageY screenX screenY".split(" "),a=e.event.mouseHooks?e.event.mouseHooks.props:[],f=e.event.props.concat(a),l={},c=0,h=0,p=0,d=!1,v=[],m=!1,g=!1,y="addEventListener"in n,b=e(n),w=1,E=0,S,x;e.vmouse={moveDistanceThreshold:10,clickDistanceThreshold:10,resetTimerDuration:1500};for(x=0;x<o.length;x++)e.event.special[o[x]]=U(o[x]);y&&n.addEventListener("click",function(t){var n=v.length,r=t.target,i,o,u,a,f,l;if(n){i=t.clientX,o=t.clientY,S=e.vmouse.clickDistanceThreshold,u=r;while(u){for(a=0;a<n;a++){f=v[a],l=0;if(u===r&&Math.abs(f.x-i)<S&&Math.abs(f.y-o)<S||e.data(u,s)===f.touchID){t.preventDefault(),t.stopPropagation();return}}u=u.parentNode}}},!0)})(e,t,n),function(e){e.mobile={}}(e),function(e,t){var r={touch:"ontouchend"in n};e.mobile.support=e.mobile.support||{},e.extend(e.support,r),e.extend(e.mobile.support,r)}(e),function(e,t,r){function l(t,n,i,s){var o=i.type;i.type=n,s?e.event.trigger(i,r,t):e.event.dispatch.call(t,i),i.type=o}var i=e(n),s=e.mobile.support.touch,o="touchmove scroll",u=s?"touchstart":"mousedown",a=s?"touchend":"mouseup",f=s?"touchmove":"mousemove";e.each("touchstart touchmove touchend tap taphold swipe swipeleft swiperight scrollstart scrollstop".split(" "),function(t,n){e.fn[n]=function(e){return e?this.bind(n,e):this.trigger(n)},e.attrFn&&(e.attrFn[n]=!0)}),e.event.special.scrollstart={enabled:!0,setup:function(){function s(e,n){r=n,l(t,r?"scrollstart":"scrollstop",e)}var t=this,n=e(t),r,i;n.bind(o,function(t){if(!e.event.special.scrollstart.enabled)return;r||s(t,!0),clearTimeout(i),i=setTimeout(function(){s(t,!1)},50)})},teardown:function(){e(this).unbind(o)}},e.event.special.tap={tapholdThreshold:750,emitTapOnTaphold:!0,setup:function(){var t=this,n=e(t),r=!1;n.bind("vmousedown",function(s){function a(){clearTimeout(u)}function f(){a(),n.unbind("vclick",c).unbind("vmouseup",a),i.unbind("vmousecancel",f)}function c(e){f(),!r&&o===e.target?l(t,"tap",e):r&&e.preventDefault()}r=!1;if(s.which&&s.which!==1)return!1;var o=s.target,u;n.bind("vmouseup",a).bind("vclick",c),i.bind("vmousecancel",f),u=setTimeout(function(){e.event.special.tap.emitTapOnTaphold||(r=!0),l(t,"taphold",e.Event("taphold",{target:o}))},e.event.special.tap.tapholdThreshold)})},teardown:function(){e(this).unbind("vmousedown").unbind("vclick").unbind("vmouseup"),i.unbind("vmousecancel")}},e.event.special.swipe={scrollSupressionThreshold:30,durationThreshold:1e3,horizontalDistanceThreshold:30,verticalDistanceThreshold:30,getLocation:function(e){var n=t.pageXOffset,r=t.pageYOffset,i=e.clientX,s=e.clientY;if(e.pageY===0&&Math.floor(s)>Math.floor(e.pageY)||e.pageX===0&&Math.floor(i)>Math.floor(e.pageX))i-=n,s-=r;else if(s<e.pageY-r||i<e.pageX-n)i=e.pageX-n,s=e.pageY-r;return{x:i,y:s}},start:function(t){var n=t.originalEvent.touches?t.originalEvent.touches[0]:t,r=e.event.special.swipe.getLocation(n);return{time:(new Date).getTime(),coords:[r.x,r.y],origin:e(t.target)}},stop:function(t){var n=t.originalEvent.touches?t.originalEvent.touches[0]:t,r=e.event.special.swipe.getLocation(n);return{time:(new Date).getTime(),coords:[r.x,r.y]}},handleSwipe:function(t,n,r,i){if(n.time-t.time<e.event.special.swipe.durationThreshold&&Math.abs(t.coords[0]-n.coords[0])>e.event.special.swipe.horizontalDistanceThreshold&&Math.abs(t.coords[1]-n.coords[1])<e.event.special.swipe.verticalDistanceThreshold){var s=t.coords[0]>n.coords[0]?"swipeleft":"swiperight";return l(r,"swipe",e.Event("swipe",{target:i,swipestart:t,swipestop:n}),!0),l(r,s,e.Event(s,{target:i,swipestart:t,swipestop:n}),!0),!0}return!1},eventInProgress:!1,setup:function(){var t,n=this,r=e(n),s={};t=e.data(this,"mobile-events"),t||(t={length:0},e.data(this,"mobile-events",t)),t.length++,t.swipe=s,s.start=function(t){if(e.event.special.swipe.eventInProgress)return;e.event.special.swipe.eventInProgress=!0;var r,o=e.event.special.swipe.start(t),u=t.target,l=!1;s.move=function(t){if(!o||t.isDefaultPrevented())return;r=e.event.special.swipe.stop(t),l||(l=e.event.special.swipe.handleSwipe(o,r,n,u),l&&(e.event.special.swipe.eventInProgress=!1)),Math.abs(o.coords[0]-r.coords[0])>e.event.special.swipe.scrollSupressionThreshold&&t.preventDefault()},s.stop=function(){l=!0,e.event.special.swipe.eventInProgress=!1,i.off(f,s.move),s.move=null},i.on(f,s.move).one(a,s.stop)},r.on(u,s.start)},teardown:function(){var t,n;t=e.data(this,"mobile-events"),t&&(n=t.swipe,delete t.swipe,t.length--,t.length===0&&e.removeData(this,"mobile-events")),n&&(n.start&&e(this).off(u,n.start),n.move&&i.off(f,n.move),n.stop&&i.off(a,n.stop))}},e.each({scrollstop:"scrollstart",taphold:"tap",swipeleft:"swipe.left",swiperight:"swipe.right"},function(t,n){e.event.special[t]={setup:function(){e(this).bind(n,e.noop)},teardown:function(){e(this).unbind(n)}}})}(e,this)});

/* === maxmegamenu.js === */
/*jslint browser: true, white: true, this: true, long: true */
/*global console,jQuery,megamenu,window,navigator*/

/*! Max Mega Menu jQuery Plugin */
(function ( $ ) {
    "use strict";

    $.maxmegamenu = function(menu, options) {
        var plugin = this;
        var $menu = $(menu);
        var $wrap = $(menu).parent();
        var $toggle_bar = $menu.siblings(".mega-menu-toggle");
        var html_body_class_timeout;

        var defaults = {
            event: $menu.attr("data-event"),
            effect: $menu.attr("data-effect"),
            effect_speed: parseInt($menu.attr("data-effect-speed")),
            effect_mobile: $menu.attr("data-effect-mobile"),
            effect_speed_mobile: parseInt($menu.attr("data-effect-speed-mobile")),
            panel_width: $menu.attr("data-panel-width"),
            panel_inner_width: $menu.attr("data-panel-inner-width"),
            mobile_force_width: $menu.attr("data-mobile-force-width"),
            mobile_overlay: $menu.attr("data-mobile-overlay"),
            mobile_state: $menu.attr("data-mobile-state"),
            mobile_direction: $menu.attr("data-mobile-direction"),
            second_click: $menu.attr("data-second-click"),
            vertical_behaviour: $menu.attr("data-vertical-behaviour"),
            document_click: $menu.attr("data-document-click"),
            breakpoint: $menu.attr("data-breakpoint"),
            unbind_events: $menu.attr("data-unbind"),
            hover_intent_timeout: $menu.attr("data-hover-intent-timeout"),
            hover_intent_interval: $menu.attr("data-hover-intent-interval")
        };

        plugin.settings = {};

        var items_with_submenus = $("li.mega-menu-megamenu.mega-menu-item-has-children," +
                                    "li.mega-menu-flyout.mega-menu-item-has-children," +
                                    "li.mega-menu-tabbed > ul.mega-sub-menu > li.mega-menu-item-has-children," +
                                    "li.mega-menu-flyout li.mega-menu-item-has-children", $menu);

        var collapse_children_parents = $("li.mega-menu-megamenu li.mega-menu-item-has-children.mega-collapse-children > a.mega-menu-link", $menu);

        plugin.addAnimatingClass = function(element) {
            if (plugin.settings.effect === "disabled") {
                return;
            }

            $(".mega-animating").removeClass("mega-animating");

            var timeout = plugin.settings.effect_speed + parseInt(plugin.settings.hover_intent_timeout, 10);

            element.addClass("mega-animating");

            setTimeout(function() {
               element.removeClass("mega-animating");
            }, timeout );
        };

        plugin.hideAllPanels = function() {
            $(".mega-toggle-on > a.mega-menu-link", $menu).each(function() {
                plugin.hidePanel($(this), false);
            });
        };

        plugin.expandMobileSubMenus = function() {
            if (plugin.settings.mobile_direction !== 'vertical') {
                return;
            }
            
            $(".mega-menu-item-has-children.mega-expand-on-mobile > a.mega-menu-link", $menu).each(function() {
                plugin.showPanel($(this), true);
            });

            if ( plugin.settings.mobile_state == 'expand_all' ) {
                $(".mega-menu-item-has-children:not(.mega-toggle-on) > a.mega-menu-link", $menu).each(function() {
                    plugin.showPanel($(this), true);
                });
            }

            if ( plugin.settings.mobile_state == 'expand_active' ) {
                const activeItemSelectors = [
                    "li.mega-current-menu-ancestor.mega-menu-item-has-children > a.mega-menu-link",
                    "li.mega-current-menu-item.mega-menu-item-has-children > a.mega-menu-link",
                    "li.mega-current-menu-parent.mega-menu-item-has-children > a.mega-menu-link",
                    "li.mega-current_page_ancestor.mega-menu-item-has-children > a.mega-menu-link",
                    "li.mega-current_page_item.mega-menu-item-has-children > a.mega-menu-link"
                ];

                $menu.find(activeItemSelectors.join(', ')).each(function() {
                    plugin.showPanel($(this), true);
                });
            }
        }

        plugin.hideSiblingPanels = function(anchor, immediate) {
            anchor.parent().parent().find(".mega-toggle-on").children("a.mega-menu-link").each(function() { // all open children of open siblings
                plugin.hidePanel($(this), immediate);
            });
        };

        plugin.isDesktopView = function() {
            var width = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
            return width > plugin.settings.breakpoint;
        };

        plugin.isMobileView = function() {
            return !plugin.isDesktopView();
        };

        plugin.showPanel = function(anchor, immediate) {
            if ( $.isNumeric(anchor) ) {
                anchor = $("li.mega-menu-item-" + anchor, $menu).find("a.mega-menu-link").first();
            } else if ( anchor.is("li.mega-menu-item") ) {
                anchor = anchor.find("a.mega-menu-link").first();
            }

            anchor.parent().triggerHandler("before_open_panel");

            anchor.parent().find("[aria-expanded]").first().attr("aria-expanded", "true");

            $(".mega-animating").removeClass("mega-animating");

            if (plugin.isMobileView() && anchor.parent().hasClass("mega-hide-sub-menu-on-mobile")) {
                return;
            }

            if (plugin.isDesktopView() && ( $menu.hasClass("mega-menu-horizontal") || $menu.hasClass("mega-menu-vertical") ) && !anchor.parent().hasClass("mega-collapse-children")) {
                plugin.hideSiblingPanels(anchor, true);
            }

            if ((plugin.isMobileView() && $wrap.hasClass("mega-keyboard-navigation")) || plugin.settings.vertical_behaviour === "accordion") {
                plugin.hideSiblingPanels(anchor, false);
            }

            plugin.calculateDynamicSubmenuWidths(anchor);

            // apply jQuery transition (only if the effect is set to "slide", other transitions are CSS based)
            if ( plugin.shouldUseSlideAnimation(anchor, immediate) ) {
                var speed = plugin.isMobileView() ? plugin.settings.effect_speed_mobile : plugin.settings.effect_speed;

                anchor.siblings(".mega-sub-menu").css("display", "none").animate({"height":"show", "paddingTop":"show", "paddingBottom":"show", "minHeight":"show"}, speed, function() {
                    $(this).css("display", "");
                });
            }

            anchor.parent().addClass("mega-toggle-on").triggerHandler("open_panel");
        };
        

        plugin.shouldUseSlideAnimation = function(anchor, immediate) {

            if (immediate == true) {
                return false;
            }

            if (anchor.parent().hasClass("mega-collapse-children")) {
                return true;
            }

            if (plugin.isDesktopView() && plugin.settings.effect === "slide") {
                return true;
            }

            if (plugin.isMobileView()) {
                if (plugin.settings.effect_mobile === "slide") {
                    return true;
                }

                if (plugin.settings.effect_mobile === "slide_left" || plugin.settings.effect_mobile === "slide_right") {
                    return plugin.settings.mobile_direction !== "horizontal";
                }
            }

            return false;
        };


        plugin.hidePanel = function(anchor, immediate) {
            if ( $.isNumeric(anchor) ) {
                anchor = $("li.mega-menu-item-" + anchor, $menu).find("a.mega-menu-link").first();
            } else if ( anchor.is("li.mega-menu-item") ) {
                anchor = anchor.find("a.mega-menu-link").first();
            }

            anchor.parent().triggerHandler("before_close_panel");

            anchor.parent().find("[aria-expanded]").first().attr("aria-expanded", "false");

            if ( plugin.shouldUseSlideAnimation(anchor) ) {
                var speed = plugin.isMobileView() ? plugin.settings.effect_speed_mobile : plugin.settings.effect_speed;

                anchor.siblings(".mega-sub-menu").animate({"height":"hide", "paddingTop":"hide", "paddingBottom":"hide", "minHeight":"hide"}, speed, function() {
                    anchor.siblings(".mega-sub-menu").css("display", "");
                    anchor.parent().removeClass("mega-toggle-on").triggerHandler("close_panel");
                });

                return;
            }

            if (immediate) {
                anchor.siblings(".mega-sub-menu").css("display", "none").delay(plugin.settings.effect_speed).queue(function(){
                    $(this).css("display", "").dequeue();
                });
            }

            // pause video widget videos
            anchor.siblings(".mega-sub-menu").find(".widget_media_video video").each(function() {
                this.player.pause();
            });

            anchor.parent().removeClass("mega-toggle-on").triggerHandler("close_panel");
            plugin.addAnimatingClass(anchor.parent());
        };

        plugin.calculateDynamicSubmenuWidths = function(anchor) {
            // apply dynamic width and sub menu position (only to top level mega menus)
            if (anchor.parent().hasClass("mega-menu-megamenu") && anchor.parent().parent().hasClass("max-mega-menu") && plugin.settings.panel_width ) {
                if (plugin.isDesktopView()) {
                    var submenu_offset = $menu.offset();
                    var target_offset = $(plugin.settings.panel_width).offset();

                    if ( plugin.settings.panel_width == '100vw' ) {
                        target_offset = $('body').offset();

                        anchor.siblings(".mega-sub-menu").css({
                            left: (target_offset.left - submenu_offset.left) + "px"
                        });
                    } else if ( $(plugin.settings.panel_width).length > 0 ) {
                        anchor.siblings(".mega-sub-menu").css({
                            width: $(plugin.settings.panel_width).outerWidth(),
                            left: (target_offset.left - submenu_offset.left) + "px"
                        });
                    }
                } else {
                    anchor.siblings(".mega-sub-menu").css({
                        width: "",
                        left: ""
                    });
                }
            }

            // apply inner width to sub menu by adding padding to the left and right of the mega menu
            if (anchor.parent().hasClass("mega-menu-megamenu") && anchor.parent().parent().hasClass("max-mega-menu") && plugin.settings.panel_inner_width && $(plugin.settings.panel_inner_width).length > 0) {
                var target_width = 0;

                if ($(plugin.settings.panel_inner_width).length) {
                    // jQuery selector
                    target_width = parseInt($(plugin.settings.panel_inner_width).width(), 10);
                } else {
                    // we"re using a pixel width
                    target_width = parseInt(plugin.settings.panel_inner_width, 10);
                }

                anchor.siblings(".mega-sub-menu").css({
                    "paddingLeft": "",
                    "paddingRight": ""
                });

                var submenu_width = parseInt(anchor.siblings(".mega-sub-menu").innerWidth(), 10);

                if (plugin.isDesktopView() && target_width > 0 && target_width < submenu_width) {
                    anchor.siblings(".mega-sub-menu").css({
                        "paddingLeft": (submenu_width - target_width) / 2 + "px",
                        "paddingRight": (submenu_width - target_width) / 2 + "px"
                    });
                }
            }
        };

        plugin.bindClickEvents = function() {

            if ( $wrap.data('has-click-events') === true ) {
                return;
            }

            $wrap.data('has-click-events', true);

            var dragging = false;

            $(document).on({
                "touchmove": function(e) { dragging = true; },
                "touchstart": function(e) { dragging = false; }
            });

            $(document).on("click touchend", function(e) { // hide menu when clicked away from
                if (!dragging && plugin.settings.document_click === "collapse" && ! $(e.target).closest(".mega-menu-wrap").length ) {
                    plugin.hideAllPanels();
                    plugin.hideMobileMenu();
                }
                dragging = false;
            });

            var clickable_parents = $("> a.mega-menu-link", items_with_submenus).add(collapse_children_parents);

            clickable_parents.on("touchend.megamenu", function(e) {
                if (plugin.settings.event === "hover_intent") {
                    plugin.unbindHoverIntentEvents();
                }

                if (plugin.settings.event === "hover") {
                    plugin.unbindHoverEvents();
                }
            });

            clickable_parents.on("click.megamenu", function(e) {
                if ( $(e.target).hasClass('mega-indicator') ) {
                    return;
                }

                if (plugin.isDesktopView() && $(this).parent().hasClass("mega-toggle-on") && $(this).closest("ul.mega-sub-menu").parent().hasClass("mega-menu-tabbed") ) {
                    if (plugin.settings.second_click === "go") {
                        return;
                    } else {
                        e.preventDefault();
                        return;
                    }
                }
                if (dragging) {
                    return;
                }
                if (plugin.isMobileView() && $(this).parent().hasClass("mega-hide-sub-menu-on-mobile")) {
                    return; // allow all clicks on parent items when sub menu is hidden on mobile
                }
                if ((plugin.settings.second_click === "go" || $(this).parent().hasClass("mega-click-click-go")) && $(this).attr("href") !== undefined) { // check for second click
                    if (!$(this).parent().hasClass("mega-toggle-on")) {
                        e.preventDefault();
                        plugin.showPanel($(this));
                    }
                } else {
                    e.preventDefault();

                    if ($(this).parent().hasClass("mega-toggle-on")) {
                        plugin.hidePanel($(this), false);
                    } else {
                        plugin.showPanel($(this));
                    }
                }
            });

            if ( plugin.settings.second_click === "disabled" ) {
                clickable_parents.off("click.megamenu");
            }

            $(".mega-close-after-click:not(.mega-menu-item-has-children) > a.mega-menu-link", $menu).on("click", function() {
                plugin.hideAllPanels();
                plugin.hideMobileMenu();
            });

            $("button.mega-close", $wrap).on("click", function(e) {
                plugin.hideMobileMenu();
            });
        };

        plugin.bindHoverEvents = function() {
            items_with_submenus.on({
                "mouseenter.megamenu" : function() {
                    plugin.unbindClickEvents();
                    if (! $(this).hasClass("mega-toggle-on")) {
                        plugin.showPanel($(this).children("a.mega-menu-link"));
                    }
                },
                "mouseleave.megamenu" : function() {
                    if ($(this).hasClass("mega-toggle-on") && ! $(this).hasClass("mega-disable-collapse") && ! $(this).parent().parent().hasClass("mega-menu-tabbed")) {
                        plugin.hidePanel($(this).children("a.mega-menu-link"), false);
                    }
                }
            });
        };

        plugin.bindHoverIntentEvents = function() {
            items_with_submenus.hoverIntent({
                over: function () {
                    plugin.unbindClickEvents();
                    if (! $(this).hasClass("mega-toggle-on")) {
                        plugin.showPanel($(this).children("a.mega-menu-link"));
                    }
                },
                out: function () {
                    if ($(this).hasClass("mega-toggle-on") && ! $(this).hasClass("mega-disable-collapse") && ! $(this).parent().parent().hasClass("mega-menu-tabbed")) {
                        plugin.hidePanel($(this).children("a.mega-menu-link"), false);
                    }
                },
                timeout: plugin.settings.hover_intent_timeout,
                interval: plugin.settings.hover_intent_interval
            });
        };

        plugin.bindKeyboardEvents = function() {
            var tab_key = 9;
            var escape_key = 27;
            var enter_key = 13;
            var left_arrow_key = 37;
            var up_arrow_key = 38;
            var right_arrow_key = 39;
            var down_arrow_key = 40;
            var space_key = 32;

            var isMobileOffCanvasHorizontal = function() {
                return plugin.isMobileView() && ( plugin.settings.effect_mobile === 'slide_right' || plugin.settings.effect_mobile === '' )  && plugin.settings.mobile_direction === 'horizontal';
            }

            var shouldTrapFocusInCurrentSubMenu = function() {
                return isMobileOffCanvasHorizontal() && ( keyCode === up_arrow_key || keyCode === down_arrow_key || keyCode === tab_key );
            }

            $wrap.on("keyup.megamenu", ".max-mega-menu, .mega-menu-toggle", function(e) {
                var keyCode = e.keyCode || e.which;
                var active_link = $(e.target);

                if (keyCode === tab_key) {
                    $wrap.addClass("mega-keyboard-navigation");
                    plugin.bindClickEvents(); // Windows Narrator ignores the Enter keypress, so ensure click events are available when pressing tab
                }
            });

            $wrap.on("keydown.megamenu", "a.mega-menu-link, .mega-indicator, .mega-menu-toggle-block, .mega-menu-toggle-animated-block button", function(e) {

                if ( ! $wrap.hasClass("mega-keyboard-navigation") ) {
                    return;
                }

                var keyCode = e.keyCode || e.which;
                var active_link = $(e.target);

                if ( keyCode === space_key && active_link.is(".mega-menu-link") ) {
                    e.preventDefault();

                    // pressing space on a parent item will always toggle the sub menu
                    if ( active_link.parent().is(items_with_submenus) ) {
                        if ( active_link.parent().hasClass("mega-toggle-on") && ! active_link.closest("ul.mega-sub-menu").parent().hasClass("mega-menu-tabbed") ) {
                            plugin.hidePanel(active_link);
                        } else {
                            plugin.showPanel(active_link);
                        }
                    }
                }

                if ( keyCode === space_key && active_link.is("mega-indicator") ) {
                    e.preventDefault();

                    if ( active_link.parent().parent().hasClass("mega-toggle-on") && ! active_link.closest("ul.mega-sub-menu").parent().hasClass("mega-menu-tabbed") ) {
                        plugin.hidePanel(active_link.parent());
                    } else {
                        plugin.showPanel(active_link.parent());
                    }
                }

                if ( keyCode === escape_key ) {
                    var submenu_open = $(".mega-toggle-on", $menu).length !== 0;

                    if ( submenu_open ) {
                        var focused_menu_item = $menu.find(":focus");

                        if ( focused_menu_item.closest('.mega-menu-flyout.mega-toggle-on').length !== 0 ) {
                            var nearest_parent_of_focused_item_li = focused_menu_item.closest('.mega-toggle-on');
                            var nearest_parent_of_focused_item_a = $("> a.mega-menu-link", nearest_parent_of_focused_item_li);
                            plugin.hidePanel(nearest_parent_of_focused_item_a);
                            nearest_parent_of_focused_item_a.focus();
                        }

                        if ( focused_menu_item.closest('.mega-menu-megamenu.mega-toggle-on').length !== 0 ) {
                            var nearest_parent_of_focused_item_li = focused_menu_item.closest('.mega-menu-megamenu.mega-toggle-on');
                            var nearest_parent_of_focused_item_a = $("> a.mega-menu-link", nearest_parent_of_focused_item_li);
                            plugin.hidePanel(nearest_parent_of_focused_item_a);
                            nearest_parent_of_focused_item_a.focus();
                        }
                    }

                    if ( plugin.isMobileView() && ! submenu_open ) {
                        plugin.hideMobileMenu();
                        $(".mega-menu-toggle-block, button.mega-toggle-animated", $toggle_bar).first().focus();
                    }
                }

                if ( keyCode === space_key || keyCode === enter_key ) {
                    if ( active_link.is(".mega-menu-toggle-block, .mega-menu-toggle-animated-block button") ) {
                        e.preventDefault();
                        
                        if ( $toggle_bar.hasClass("mega-menu-open") ) {
                            plugin.hideMobileMenu();
                        } else {
                            plugin.showMobileMenu();
                        }
                    }
                }

                if ( keyCode === enter_key ) { // ignored by windows narrator

                    // pressing enter on an arrow will toggle the sub menu
                    if ( active_link.is(".mega-indicator") ) {
                        if ( active_link.closest("li.mega-menu-item").hasClass("mega-toggle-on") && ! active_link.closest("ul.mega-sub-menu").parent().hasClass("mega-menu-tabbed") ) {
                            plugin.hidePanel(active_link.parent());
                        } else {
                            plugin.showPanel(active_link.parent());
                        }

                        return;
                    }
                    // pressing enter on a parent link
                    if ( active_link.parent().is(items_with_submenus) ) {

                        // when clicking on the parent of a hidden submenu, follow the link
                        if ( plugin.isMobileView() && active_link.parent().is(".mega-hide-sub-menu-on-mobile") ) {
                            return;
                        }

                        // pressing enter on a parent item without a link will toggle the sub menu
                        if ( active_link.is("[href]") === false ) {
                            if ( active_link.parent().hasClass("mega-toggle-on") && ! active_link.closest("ul.mega-sub-menu").parent().hasClass("mega-menu-tabbed") ) {
                                plugin.hidePanel(active_link);
                            } else {
                                plugin.showPanel(active_link);
                            }

                            return;
                        }

                        // pressing enter on a parent item will first open the sub menu, then follow the link
                        if ( active_link.parent().hasClass("mega-toggle-on") && ! active_link.closest("ul.mega-sub-menu").parent().hasClass("mega-menu-tabbed") ) {
                            return;
                        } else {
                            e.preventDefault();
                            plugin.showPanel(active_link);
                        }
                    }
                }

                if ( shouldTrapFocusInCurrentSubMenu() ) {
                    var focused_item = $(":focus", $menu);

                    // if the menu doesn't have focus, focus the first menu item
                    if ( focused_item.length === 0) {
                        e.preventDefault();
                        $("> li.mega-menu-item:visible", $menu).find("> a.mega-menu-link, .mega-search span[role=button]").first().focus();
                        return;
                    }

                    // try to find the next item at the same level
                    var next_item_to_focus = focused_item.parent().nextAll("li.mega-menu-item:visible").find("> a.mega-menu-link, .mega-search span[role=button]").first();

                    // can't find another item in the same level, attempt to skip back to the top
                    if ( next_item_to_focus.length === 0 && focused_item.closest(".mega-menu-megamenu").length !== 0 ) {
                        // are we inside a megamenu? find the 'back' button and focus on that
                        var all_li_parents = focused_item.parentsUntil(".mega-menu-megamenu");

                        if ( focused_item.is(all_li_parents.find("a.mega-menu-link").last()) ) {
                            next_item_to_focus = all_li_parents.find(".mega-back-button:visible > a.mega-menu-link").first();
                        }
                    }

                    // skip back to the top of non-megamenu menus
                    if ( next_item_to_focus.length === 0 ) {
                        next_item_to_focus = focused_item.parent().prevAll("li.mega-menu-item:visible").find("> a.mega-menu-link, .mega-search span[role=button]").first();
                    }

                    if ( next_item_to_focus.length !== 0 ) {
                        e.preventDefault();
                        next_item_to_focus.focus();
                    }
                    
                }

                var shouldGoToNextTopLevelItem = function() {
                    return ( ( keyCode === right_arrow_key && plugin.isDesktopView() ) || ( keyCode === down_arrow_key && plugin.isMobileView() ) ) && $menu.hasClass("mega-menu-horizontal");
                }

                var shouldGoToPreviousTopLevelItem = function() {
                    return ( ( keyCode === left_arrow_key && plugin.isDesktopView() ) || ( keyCode === up_arrow_key && plugin.isMobileView() ) ) && $menu.hasClass("mega-menu-horizontal");
                }

                if ( shouldGoToNextTopLevelItem() ) {
                    e.preventDefault();

                    var next_top_level_item = $("> .mega-toggle-on", $menu).nextAll("li.mega-menu-item:visible").find("> a.mega-menu-link, .mega-search span[role=button]").first();

                    if (next_top_level_item.length === 0) {
                        next_top_level_item = $(":focus", $menu).parent().nextAll("li.mega-menu-item:visible").find("> a.mega-menu-link, .mega-search span[role=button]").first();
                    }

                    if (next_top_level_item.length === 0) {
                        next_top_level_item = $(":focus", $menu).parent().parent().parent().nextAll("li.mega-menu-item:visible").find("> a.mega-menu-link, .mega-search span[role=button]").first();
                    }

                    plugin.hideAllPanels();
                    next_top_level_item.focus();
                }

                if ( shouldGoToPreviousTopLevelItem() ) {
                    e.preventDefault();

                    var prev_top_level_item = $("> .mega-toggle-on", $menu).prevAll("li.mega-menu-item:visible").find("> a.mega-menu-link, .mega-search span[role=button]").last();

                    if (prev_top_level_item.length === 0) {
                        prev_top_level_item = $(":focus", $menu).parent().prevAll("li.mega-menu-item:visible").find("> a.mega-menu-link, .mega-search span[role=button]").last();
                    }

                    if (prev_top_level_item.length === 0) {
                        prev_top_level_item = $(":focus", $menu).parent().parent().parent().prevAll("li.mega-menu-item:visible").find("> a.mega-menu-link, .mega-search span[role=button]").last();
                    }

                    plugin.hideAllPanels();
                    prev_top_level_item.focus();
                }
            });

            $wrap.on("focusout.megamenu", function(e) {
                if ( $wrap.hasClass("mega-keyboard-navigation") ) {
                    setTimeout(function() {
                        var menu_has_focus = $wrap.find(":focus").length > 0;
                        if (! menu_has_focus) {
                            $wrap.removeClass("mega-keyboard-navigation");
                            plugin.hideAllPanels();
                            plugin.hideMobileMenu();
                        }
                    }, 10);
                }
            });
        };

        plugin.unbindAllEvents = function() {
            $("ul.mega-sub-menu, li.mega-menu-item, li.mega-menu-row, li.mega-menu-column, a.mega-menu-link, .mega-indicator", $menu).off().unbind();
        };

        plugin.unbindClickEvents = function() {
            if ( $wrap.hasClass('mega-keyboard-navigation') ) {
                return;
            }

            // collapsable parents always have a click event
            $("> a.mega-menu-link", items_with_submenus).not(collapse_children_parents).off("click.megamenu touchend.megamenu");

            $wrap.data('has-click-events', false);
        };

        plugin.unbindHoverEvents = function() {
            items_with_submenus.off("mouseenter.megamenu mouseleave.megamenu");
        };

        plugin.unbindHoverIntentEvents = function() {
            items_with_submenus.off("mouseenter mouseleave").removeProp("hoverIntent_t").removeProp("hoverIntent_s"); // hoverintent does not allow namespaced events
        };

        plugin.unbindKeyboardEvents = function() {
            $wrap.off("keyup.megamenu keydown.megamenu focusout.megamenu");
        };

        plugin.unbindMegaMenuEvents = function() {
            if (plugin.settings.event === "hover_intent") {
                plugin.unbindHoverIntentEvents();
            }

            if (plugin.settings.event === "hover") {
                plugin.unbindHoverEvents();
            }

            plugin.unbindClickEvents();
            plugin.unbindKeyboardEvents();
        };

        plugin.bindMegaMenuEvents = function() {
            plugin.unbindMegaMenuEvents();

            if (plugin.isDesktopView() && plugin.settings.event === "hover_intent") {
                plugin.bindHoverIntentEvents();
            }

            if (plugin.isDesktopView() && plugin.settings.event === "hover") {
                plugin.bindHoverEvents();
            }

            plugin.bindClickEvents(); // always bind click events for touch screen devices
            plugin.bindKeyboardEvents();
        };

        plugin.checkWidth = function() {
            if ( plugin.isMobileView() && $menu.data("view") === "desktop" ) {
                plugin.switchToMobile();
            }

            if ( plugin.isDesktopView() && $menu.data("view") === "mobile" ) {
                plugin.switchToDesktop();
            }

            plugin.calculateDynamicSubmenuWidths($("> li.mega-menu-megamenu > a.mega-menu-link", $menu));
        };

        plugin.reverseRightAlignedItems = function() {
            if ( ! $("body").hasClass("rtl") && $menu.hasClass("mega-menu-horizontal") && $menu.css("display") !== 'flex' ) {
                $menu.append($menu.children("li.mega-item-align-right").get().reverse());
            }
        };

        plugin.addClearClassesToMobileItems = function() {
            $(".mega-menu-row", $menu).each(function() {
                $("> .mega-sub-menu > .mega-menu-column:not(.mega-hide-on-mobile)", $(this)).filter(":even").addClass("mega-menu-clear"); // :even is 0 based
            });
        };

        plugin.initDesktop = function() {
            $menu.data("view", "desktop");
            plugin.bindMegaMenuEvents();
            plugin.initIndicators();
        };

        plugin.initMobile = function() {
            plugin.switchToMobile();
        };

        plugin.switchToDesktop = function() {
            $menu.data("view", "desktop");
            plugin.bindMegaMenuEvents();
            plugin.reverseRightAlignedItems();
            plugin.hideAllPanels();
            plugin.hideMobileMenu(true);
        };

        plugin.switchToMobile = function() {
            $menu.data("view", "mobile");
            plugin.bindMegaMenuEvents();
            plugin.initIndicators();
            plugin.reverseRightAlignedItems();
            plugin.addClearClassesToMobileItems();
            plugin.hideAllPanels();
            plugin.expandMobileSubMenus();
        };

        plugin.initToggleBar = function() {
            $toggle_bar.on("click", function(e) {
                if ( $(e.target).is(".mega-menu-toggle, .mega-menu-toggle-custom-block *, .mega-menu-toggle-block, .mega-menu-toggle-animated-block, .mega-menu-toggle-animated-block *, .mega-toggle-blocks-left, .mega-toggle-blocks-center, .mega-toggle-blocks-right, .mega-toggle-label, .mega-toggle-label span") ) {
                    e.preventDefault();
                    
                    if ($(this).hasClass("mega-menu-open")) {
                        plugin.hideMobileMenu();
                    } else {
                        plugin.showMobileMenu();
                    }
                }
            });
        };

        plugin.initIndicators = function() {
             $menu.off('click.megamenu', '.mega-indicator');

             $menu.on('click.megamenu', '.mega-indicator', function(e) {
                e.preventDefault();
                e.stopPropagation();

                if ( $(this).closest(".mega-menu-item").hasClass("mega-toggle-on") ) {
                    if ( ! $(this).closest("ul.mega-sub-menu").parent().hasClass("mega-menu-tabbed") || plugin.isMobileView() ) {
                        plugin.hidePanel($(this).parent(), false);
                    }
                } else {
                    plugin.showPanel($(this).parent(), false);
                }
             });
        };

        plugin.hideMobileMenu = function(force) {
            force = force || false;

            if ( ! $toggle_bar.is(":visible") && ! force ) {
                return;
            }

            html_body_class_timeout = setTimeout(function() {
                $("body").removeClass($menu.attr("id") + "-mobile-open");
                $("html").removeClass($menu.attr("id") + "-off-canvas-open");
            }, plugin.settings.effect_speed_mobile);

            $(".mega-toggle-label, .mega-toggle-animated", $toggle_bar).attr("aria-expanded", "false");

            if (plugin.settings.effect_mobile === "slide" && ! force ) {
                $menu.animate({"height":"hide"}, plugin.settings.effect_speed_mobile, function() {
                    $menu.css({
                        width: "",
                        left: "",
                        display: ""
                    });

                    $toggle_bar.removeClass("mega-menu-open");
                });
            } else {
                $menu.css({
                    width: "",
                    left: "",
                    display: ""
                });
                    
                $toggle_bar.removeClass("mega-menu-open");
            }

            $menu.triggerHandler("mmm:hideMobileMenu");
        };

        plugin.showMobileMenu = function() {
            if ( ! $toggle_bar.is(":visible")) {
                return;
            }

            clearTimeout(html_body_class_timeout);

            $("body").addClass($menu.attr("id") + "-mobile-open");

            plugin.expandMobileSubMenus();

            if ( plugin.settings.effect_mobile === "slide_left" || plugin.settings.effect_mobile === "slide_right" ) {
                $("html").addClass($menu.attr("id") + "-off-canvas-open");
            }

            $(".mega-toggle-label, .mega-toggle-animated", $toggle_bar).attr("aria-expanded", "true");

            if (plugin.settings.effect_mobile === "slide") {
                $menu.animate({"height":"show"}, plugin.settings.effect_speed_mobile, function() {
                    $(this).css("display", "");
                });
            }

            $toggle_bar.addClass("mega-menu-open");

            plugin.toggleBarForceWidth();

            $menu.triggerHandler("mmm:showMobileMenu");
        };

        plugin.toggleBarForceWidth = function() {
            if ($(plugin.settings.mobile_force_width).length && ( plugin.settings.effect_mobile === "slide" || plugin.settings.effect_mobile === "disabled" ) ) {
                var submenu_offset = $toggle_bar.offset();
                var target_offset = $(plugin.settings.mobile_force_width).offset();

                $menu.css({
                    width: $(plugin.settings.mobile_force_width).outerWidth(),
                    left: (target_offset.left - submenu_offset.left) + "px"
                });
            }
        };

        plugin.doConsoleChecks = function() {
            if (plugin.settings.mobile_force_width != "false" && ! $(plugin.settings.mobile_force_width).length && ( plugin.settings.effect_mobile === "slide" || plugin.settings.effect_mobile === "disabled" ) ) {
                console.warn('Max Mega Menu #' + $wrap.attr('id') + ': Mobile Force Width element (' + plugin.settings.mobile_force_width + ') not found');
            }

            const cssWidthRegex = /^((\d+(\.\d+)?(px|%|em|rem|vw|vh|ch|ex|cm|mm|in|pt|pc))|auto)$/i;

            if (plugin.settings.panel_width !== undefined && ! cssWidthRegex.test(plugin.settings.panel_width) && ! $(plugin.settings.panel_width).length ) {
                console.warn('Max Mega Menu #' + $wrap.attr('id') + ': Panel Width (Outer) element (' + plugin.settings.panel_width + ') not found');
            }

            if (plugin.settings.panel_inner_width !== undefined && ! cssWidthRegex.test(plugin.settings.panel_inner_width) && ! $(plugin.settings.panel_inner_width).length ) {
                console.warn('Max Mega Menu #' + $wrap.attr('id') + ': Panel Width (Inner) element (' + plugin.settings.panel_inner_width + ') not found');
            }
        }

        plugin.init = function() {
            $menu.triggerHandler("before_mega_menu_init");
            plugin.settings = $.extend({}, defaults, options);

            if (window.console) {
                plugin.doConsoleChecks();
            }

            $menu.removeClass("mega-no-js");

            plugin.initToggleBar();
            
            if (plugin.settings.unbind_events === "true") {
                plugin.unbindAllEvents();
            }

            $(window).on("load", function() {
                plugin.calculateDynamicSubmenuWidths($("> li.mega-menu-megamenu > a.mega-menu-link", $menu));
            });

            if ( plugin.isDesktopView() ) {
                plugin.initDesktop();
            } else {
                plugin.initMobile();
            }

            $(window).on("resize", function() {
                plugin.checkWidth();
            });

            $menu.triggerHandler("after_mega_menu_init");
        };

        plugin.init();
    };

    $.fn.maxmegamenu = function(options) {
        return this.each(function() {
            if (undefined === $(this).data("maxmegamenu")) {
                var plugin = new $.maxmegamenu(this, options);
                $(this).data("maxmegamenu", plugin);
            }
        });
    };

    $(function() {
        $(".max-mega-menu").maxmegamenu();
    });
}( jQuery ));

/* === audio.js === */
// A cross-browser javascript shim for html5 audio
(function(audiojs, audiojsInstance, container) {
  // Use the path to the audio.js file to create relative paths to the swf and player graphics
  // Remember that some systems (e.g. ruby on rails) append strings like '?1301478336' to asset paths
  var path = (function() {
    var re = new RegExp('audio(\.min)?\.js.*'),
        scripts = document.getElementsByTagName('script');
    for (var i = 0, ii = scripts.length; i < ii; i++) {
      var path = scripts[i].getAttribute('src');
      if(re.test(path)) return path.replace(re, '');
    }
  })();
  
  // ##The audiojs interface
  // This is the global object which provides an interface for creating new `audiojs` instances.
  // It also stores all of the construction helper methods and variables.
  container[audiojs] = {
    instanceCount: 0,
    instances: {},
    // The markup for the swf. It is injected into the page if there is not support for the `<audio>` element. The `$n`s are placeholders.  
    // `$1` The name of the flash movie  
    // `$2` The path to the swf  
    // `$3` Cache invalidation  
    flashSource: '\
      <object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" id="$1" width="1" height="1" name="$1" style="position: absolute; left: -1px;"> \
        <param name="movie" value="$2?playerInstance='+audiojs+'.instances[\'$1\']&datetime=$3"> \
        <param name="allowscriptaccess" value="always"> \
        <embed name="$1" src="$2?playerInstance='+audiojs+'.instances[\'$1\']&datetime=$3" width="1" height="1" allowscriptaccess="always"> \
      </object>',

    // ### The main settings object
    // Where all the default settings are stored. Each of these variables and methods can be overwritten by the user-provided `options` object.
    settings: {
      autoplay: false,
      loop: false,
      preload: true,
      imageLocation: path + 'player-graphics.gif',
      swfLocation: path + 'audiojs.swf',
      useFlash: (function() {
        var a = document.createElement('audio');
        return !(a.canPlayType && a.canPlayType('audio/mpeg;').replace(/no/, ''));
      })(),
      hasFlash: (function() {
        if (navigator.plugins && navigator.plugins.length && navigator.plugins['Shockwave Flash']) {
          return true;
        } else if (navigator.mimeTypes && navigator.mimeTypes.length) {
          var mimeType = navigator.mimeTypes['application/x-shockwave-flash'];
          return mimeType && mimeType.enabledPlugin;
        } else {
          try {
            var ax = new ActiveXObject('ShockwaveFlash.ShockwaveFlash');
            return true;
          } catch (e) {}
        }
        return false;
      })(),
      // The default markup and classes for creating the player:
      createPlayer: {
        markup: '\
          <div class="play-pause"> \
            <p class="play"></p> \
            <p class="pause"></p> \
            <p class="loading"></p> \
            <p class="error"></p> \
          </div> \
          <div class="scrubber"> \
            <div class="progress"></div> \
            <div class="loaded"></div> \
          </div> \
          <div class="time"> \
            <em class="played">00:00</em><strong class="duration">00:00</strong> \
          </div> \
          <div class="error-message"></div>',
        playPauseClass: 'play-pause',
        scrubberClass: 'scrubber',
        progressClass: 'progress',
        loaderClass: 'loaded',
        timeClass: 'time',
        durationClass: 'duration',
        playedClass: 'played',
        errorMessageClass: 'error-message',
        playingClass: 'playing',
        loadingClass: 'loading',
        errorClass: 'error'
      },
      // The css used by the default player. This is is dynamically injected into a `<style>` tag in the top of the head.
      css: '\
        .audiojs audio { position: absolute; left: -1px; } \
        .audiojs { width: 460px; height: 36px; background: #404040; overflow: hidden; font-family: monospace; font-size: 12px; \
          background-image: -webkit-gradient(linear, left top, left bottom, color-stop(0, #444), color-stop(0.5, #555), color-stop(0.51, #444), color-stop(1, #444)); \
          background-image: -moz-linear-gradient(center top, #444 0%, #555 50%, #444 51%, #444 100%); \
          -webkit-box-shadow: 1px 1px 8px rgba(0, 0, 0, 0.3); -moz-box-shadow: 1px 1px 8px rgba(0, 0, 0, 0.3); \
          -o-box-shadow: 1px 1px 8px rgba(0, 0, 0, 0.3); box-shadow: 1px 1px 8px rgba(0, 0, 0, 0.3); } \
        .audiojs .play-pause { width: 25px; height: 40px; padding: 4px 6px; margin: 0px; float: left; overflow: hidden; border-right: 1px solid #000; } \
        .audiojs p { display: none; width: 25px; height: 40px; margin: 0px; cursor: pointer; } \
        .audiojs .play { display: block; } \
        .audiojs .scrubber { position: relative; float: left; width: 280px; background: #5a5a5a; height: 14px; margin: 10px; border-top: 1px solid #3f3f3f; border-left: 0px; border-bottom: 0px; overflow: hidden; } \
        .audiojs .progress { position: absolute; top: 0px; left: 0px; height: 14px; width: 0px; background: #ccc; z-index: 1; \
          background-image: -webkit-gradient(linear, left top, left bottom, color-stop(0, #ccc), color-stop(0.5, #ddd), color-stop(0.51, #ccc), color-stop(1, #ccc)); \
          background-image: -moz-linear-gradient(center top, #ccc 0%, #ddd 50%, #ccc 51%, #ccc 100%); } \
        .audiojs .loaded { position: absolute; top: 0px; left: 0px; height: 14px; width: 0px; background: #000; \
          background-image: -webkit-gradient(linear, left top, left bottom, color-stop(0, #222), color-stop(0.5, #333), color-stop(0.51, #222), color-stop(1, #222)); \
          background-image: -moz-linear-gradient(center top, #222 0%, #333 50%, #222 51%, #222 100%); } \
        .audiojs .time { float: left; height: 36px; line-height: 36px; margin: 0px 0px 0px 6px; padding: 0px 6px 0px 12px; border-left: 1px solid #000; color: #ddd; text-shadow: 1px 1px 0px rgba(0, 0, 0, 0.5); } \
        .audiojs .time em { padding: 0px 2px 0px 0px; color: #f9f9f9; font-style: normal; } \
        .audiojs .time strong { padding: 0px 0px 0px 2px; font-weight: normal; } \
        .audiojs .error-message { float: left; display: none; margin: 0px 10px; height: 36px; width: 400px; overflow: hidden; line-height: 36px; white-space: nowrap; color: #fff; \
          text-overflow: ellipsis; -o-text-overflow: ellipsis; -icab-text-overflow: ellipsis; -khtml-text-overflow: ellipsis; -moz-text-overflow: ellipsis; -webkit-text-overflow: ellipsis; } \
        .audiojs .error-message a { color: #eee; text-decoration: none; padding-bottom: 1px; border-bottom: 1px solid #999; white-space: wrap; } \
        \
        .audiojs .play { background: url("$1") -2px -1px no-repeat; } \
        .audiojs .loading { background: url("$1") -2px -31px no-repeat; } \
        .audiojs .error { background: url("$1") -2px -61px no-repeat; } \
        .audiojs .pause { background: url("$1") -2px -91px no-repeat; } \
        \
        .playing .play, .playing .loading, .playing .error { display: none; } \
        .playing .pause { display: block; } \
        \
        .loading .play, .loading .pause, .loading .error { display: none; } \
        .loading .loading { display: block; } \
        \
        .error .time, .error .play, .error .pause, .error .scrubber, .error .loading { display: none; } \
        .error .error { display: block; } \
        .error .play-pause p { cursor: auto; } \
        .error .error-message { display: block; }',
      // The default event callbacks:
      trackEnded: function(e) {},
      flashError: function() {
        var player = this.settings.createPlayer,
            errorMessage = getByClass(player.errorMessageClass, this.wrapper),
            html = 'Missing <a href="http://get.adobe.com/flashplayer/">flash player</a> plugin.';
        if (this.mp3) html += ' <a href="'+this.mp3+'">Download audio file</a>.';
        container[audiojs].helpers.removeClass(this.wrapper, player.loadingClass);
        container[audiojs].helpers.addClass(this.wrapper, player.errorClass);
        errorMessage.innerHTML = html;
      },
      loadError: function(e) {
        var player = this.settings.createPlayer,
            errorMessage = getByClass(player.errorMessageClass, this.wrapper);
        container[audiojs].helpers.removeClass(this.wrapper, player.loadingClass);
        container[audiojs].helpers.addClass(this.wrapper, player.errorClass);
        errorMessage.innerHTML = 'Error loading: "'+this.mp3+'"';
      },
      init: function() {
        var player = this.settings.createPlayer;
        container[audiojs].helpers.addClass(this.wrapper, player.loadingClass);
      },
      loadStarted: function() {
        var player = this.settings.createPlayer,
            duration = getByClass(player.durationClass, this.wrapper),
            m = Math.floor(this.duration / 60),
            s = Math.floor(this.duration % 60);
        container[audiojs].helpers.removeClass(this.wrapper, player.loadingClass);
        duration.innerHTML = ((m<10?'0':'')+m+':'+(s<10?'0':'')+s);
      },
      loadProgress: function(percent) {
        var player = this.settings.createPlayer,
            loaded = getByClass(player.loaderClass, this.wrapper);
        loaded.style.width = (100 * percent) + '%';
      },
      playPause: function() {
        if (this.playing) this.settings.play();
        else this.settings.pause();
      },
      play: function() {
        var player = this.settings.createPlayer;
        container[audiojs].helpers.addClass(this.wrapper, player.playingClass);
      },
      pause: function() {
        var player = this.settings.createPlayer;
        container[audiojs].helpers.removeClass(this.wrapper, player.playingClass);
      },
      updatePlayhead: function(percent) {
        var player = this.settings.createPlayer,
            progress = getByClass(player.progressClass, this.wrapper);
        progress.style.width = (100 * percent) + '%';

        var played = getByClass(player.playedClass, this.wrapper),
            p = this.duration * percent,
            m = Math.floor(p / 60),
            s = Math.floor(p % 60);
        played.innerHTML = ((m<10?'0':'')+m+':'+(s<10?'0':'')+s);
      }
    },

    // ### Contructor functions

    // `create()`  
    // Used to create a single `audiojs` instance.  
    // If an array is passed then it calls back to `createAll()`.  
    // Otherwise, it creates a single instance and returns it.  
    create: function(element, options) {
      var options = options || {}
      if (element.length) {
        return this.createAll(options, element);
      } else {
        return this.newInstance(element, options);
      }
    },

    // `createAll()`  
    // Creates multiple `audiojs` instances.  
    // If `elements` is `null`, then automatically find any `<audio>` tags on the page and create `audiojs` instances for them.
    createAll: function(options, elements) {
      var audioElements = elements || document.getElementsByTagName('audio'),
          instances = []
          options = options || {};
      for (var i = 0, ii = audioElements.length; i < ii; i++) {
        instances.push(this.newInstance(audioElements[i], options));
      }
      return instances;
    },

    // ### Creating and returning a new instance
    // This goes through all the steps required to build out a usable `audiojs` instance.
    newInstance: function(element, options) {
      var element = element,
          s = this.helpers.clone(this.settings),
          id = 'audiojs'+this.instanceCount,
          wrapperId = 'audiojs_wrapper'+this.instanceCount,
          instanceCount = this.instanceCount++;

      // Check for `autoplay`, `loop` and `preload` attributes and write them into the settings.
      if (element.getAttribute('autoplay') != null) s.autoplay = true;
      if (element.getAttribute('loop') != null) s.loop = true;
      if (element.getAttribute('preload') == 'none') s.preload = false;
      // Merge the default settings with the user-defined `options`.
      if (options) this.helpers.merge(s, options);

      // Inject the player html if required.
      if (s.createPlayer.markup) element = this.createPlayer(element, s.createPlayer, wrapperId);
      else element.parentNode.setAttribute('id', wrapperId);

      // Return a new `audiojs` instance.
      var audio = new container[audiojsInstance](element, s);

      // If css has been passed in, dynamically inject it into the `<head>`.
      if (s.css) this.helpers.injectCss(audio, s.css);

      // If `<audio>` or mp3 playback isn't supported, insert the swf & attach the required events for it.
      if (s.useFlash && s.hasFlash) {
        this.injectFlash(audio, id);
        this.attachFlashEvents(audio.wrapper, audio);
      } else if (s.useFlash && !s.hasFlash) {
        this.settings.flashError.apply(audio);
      }

      // Attach event callbacks to the new audiojs instance.
      if (!s.useFlash || (s.useFlash && s.hasFlash)) this.attachEvents(audio.wrapper, audio);

      // Store the newly-created `audiojs` instance.
      this.instances[id] = audio;
      return audio;
    },

    // ### Helper methods for constructing a working player
    // Inject a wrapping div and the markup for the html player.
    createPlayer: function(element, player, id) {
      var wrapper = document.createElement('div'),
          newElement = element.cloneNode(true);
      wrapper.setAttribute('class', 'audiojs');
      wrapper.setAttribute('className', 'audiojs');
      wrapper.setAttribute('id', id);

      // Fix IE's broken implementation of `innerHTML` & `cloneNode` for HTML5 elements.
      if (newElement.outerHTML && !document.createElement('audio').canPlayType) {
        newElement = this.helpers.cloneHtml5Node(element);
        wrapper.innerHTML = player.markup;
        wrapper.appendChild(newElement);
        element.outerHTML = wrapper.outerHTML;
        wrapper = document.getElementById(id);
      } else {
        wrapper.appendChild(newElement);
        wrapper.innerHTML = wrapper.innerHTML + player.markup;
        element.parentNode.replaceChild(wrapper, element);
      }
      return wrapper.getElementsByTagName('audio')[0];
    },

    // Attaches useful event callbacks to an `audiojs` instance.
    attachEvents: function(wrapper, audio) {
      if (!audio.settings.createPlayer) return;
      var player = audio.settings.createPlayer,
          playPause = getByClass(player.playPauseClass, wrapper),
          scrubber = getByClass(player.scrubberClass, wrapper),
          leftPos = function(elem) {
            var curleft = 0;
            if (elem.offsetParent) {
              do { curleft += elem.offsetLeft; } while (elem = elem.offsetParent);
            }
            return curleft;
          };

      container[audiojs].events.addListener(playPause, 'click', function(e) {
        audio.playPause.apply(audio);
      });

      container[audiojs].events.addListener(scrubber, 'click', function(e) {
        var relativeLeft = e.clientX - leftPos(this);
        audio.skipTo(relativeLeft / scrubber.offsetWidth);
      });

      // _If flash is being used, then the following handlers don't need to be registered._
      if (audio.settings.useFlash) return;

      // Start tracking the load progress of the track.
      container[audiojs].events.trackLoadProgress(audio);

      container[audiojs].events.addListener(audio.element, 'timeupdate', function(e) {
        audio.updatePlayhead.apply(audio);
      });

      container[audiojs].events.addListener(audio.element, 'ended', function(e) {
        audio.trackEnded.apply(audio);
      });

      container[audiojs].events.addListener(audio.source, 'error', function(e) {
        // on error, cancel any load timers that are running.
        clearInterval(audio.readyTimer);
        clearInterval(audio.loadTimer);
        audio.settings.loadError.apply(audio);
      });

    },

    // Flash requires a slightly different API to the `<audio>` element, so this method is used to overwrite the standard event handlers.
    attachFlashEvents: function(element, audio) {
      audio['swfReady'] = false;
      audio['load'] = function(mp3) {
        // If the swf isn't ready yet then just set `audio.mp3`. `init()` will load it in once the swf is ready.
        audio.mp3 = mp3;
        if (audio.swfReady) audio.element.load(mp3);
      }
      audio['loadProgress'] = function(percent, duration) {
        audio.loadedPercent = percent;
        audio.duration = duration;
        audio.settings.loadStarted.apply(audio);
        audio.settings.loadProgress.apply(audio, [percent]);
      }
      audio['skipTo'] = function(percent) {
        if (percent > audio.loadedPercent) return;
        audio.updatePlayhead.call(audio, [percent])
        audio.element.skipTo(percent);
      }
      audio['updatePlayhead'] = function(percent) {
        audio.settings.updatePlayhead.apply(audio, [percent]);
      }
      audio['play'] = function() {
        // If the audio hasn't started preloading, then start it now.  
        // Then set `preload` to `true`, so that any tracks loaded in subsequently are loaded straight away.
        if (!audio.settings.preload) {
          audio.settings.preload = true;
          audio.element.init(audio.mp3);
        }
        audio.playing = true;
        // IE doesn't allow a method named `play()` to be exposed through `ExternalInterface`, so lets go with `pplay()`.  
        // <http://dev.nuclearrooster.com/2008/07/27/externalinterfaceaddcallback-can-cause-ie-js-errors-with-certain-keyworkds/>
        audio.element.pplay();
        audio.settings.play.apply(audio);
      }
      audio['pause'] = function() {
        audio.playing = false;
        // Use `ppause()` for consistency with `pplay()`, even though it isn't really required.
        audio.element.ppause();
        audio.settings.pause.apply(audio);
      }
      audio['setVolume'] = function(v) {
        audio.element.setVolume(v);
      }
      audio['loadStarted'] = function() {
        // Load the mp3 specified by the audio element into the swf.
        audio.swfReady = true;
        if (audio.settings.preload) audio.element.init(audio.mp3);
        if (audio.settings.autoplay) audio.play.apply(audio);
      }
    },

    // ### Injecting an swf from a string
    // Build up the swf source by replacing the `$keys` and then inject the markup into the page.
    injectFlash: function(audio, id) {
      var flashSource = this.flashSource.replace(/\$1/g, id);
      flashSource = flashSource.replace(/\$2/g, audio.settings.swfLocation);
      // `(+new Date)` ensures the swf is not pulled out of cache. The fixes an issue with Firefox running multiple players on the same page.
      flashSource = flashSource.replace(/\$3/g, (+new Date + Math.random()));
      // Inject the player markup using a more verbose `innerHTML` insertion technique that works with IE.
      var html = audio.wrapper.innerHTML,
          div = document.createElement('div');
      div.innerHTML = flashSource + html;
      audio.wrapper.innerHTML = div.innerHTML;
      audio.element = this.helpers.getSwf(id);
    },

    // ## Helper functions
    helpers: {
      // **Merge two objects, with `obj2` overwriting `obj1`**  
      // The merge is shallow, but that's all that is required for our purposes.
      merge: function(obj1, obj2) {
        for (attr in obj2) {
          if (obj1.hasOwnProperty(attr) || obj2.hasOwnProperty(attr)) {
            obj1[attr] = obj2[attr];
          }
        }
      },
      // **Clone a javascript object (recursively)**
      clone: function(obj){
        if (obj == null || typeof(obj) !== 'object') return obj;
        var temp = new obj.constructor();
        for (var key in obj) temp[key] = arguments.callee(obj[key]);
        return temp;
      },
      // **Adding/removing classnames from elements**
      addClass: function(element, className) {
        var re = new RegExp('(\\s|^)'+className+'(\\s|$)');
        if (re.test(element.className)) return;
        element.className += ' ' + className;
      },
      removeClass: function(element, className) {
        var re = new RegExp('(\\s|^)'+className+'(\\s|$)');
        element.className = element.className.replace(re,' ');
      },
      // **Dynamic CSS injection**  
      // Takes a string of css, inserts it into a `<style>`, then injects it in at the very top of the `<head>`. This ensures any user-defined styles will take precedence.
      injectCss: function(audio, string) {

        // If an `audiojs` `<style>` tag already exists, then append to it rather than creating a whole new `<style>`.
        var prepend = '',
            styles = document.getElementsByTagName('style'),
            css = string.replace(/\$1/g, audio.settings.imageLocation);

        for (var i = 0, ii = styles.length; i < ii; i++) {
          var title = styles[i].getAttribute('title');
          if (title && ~title.indexOf('audiojs')) {
            style = styles[i];
            if (style.innerHTML === css) return;
            prepend = style.innerHTML;
            break;
          }
        };

        var head = document.getElementsByTagName('head')[0],
            firstchild = head.firstChild,
            style = document.createElement('style');

        if (!head) return;

        style.setAttribute('type', 'text/css');
        style.setAttribute('title', 'audiojs');

        if (style.styleSheet) style.styleSheet.cssText = prepend + css;
        else style.appendChild(document.createTextNode(prepend + css));

        if (firstchild) head.insertBefore(style, firstchild);
        else head.appendChild(styleElement);
      },
      // **Handle all the IE6+7 requirements for cloning `<audio>` nodes**  
      // Create a html5-safe document fragment by injecting an `<audio>` element into the document fragment.
      cloneHtml5Node: function(audioTag) {
        var fragment = document.createDocumentFragment(),
            doc = fragment.createElement ? fragment : document;
        doc.createElement('audio');
        var div = doc.createElement('div');
        fragment.appendChild(div);
        div.innerHTML = audioTag.outerHTML;
        return div.firstChild;
      },
      // **Cross-browser `<object>` / `<embed>` element selection**
      getSwf: function(name) {
        var swf = document[name] || window[name];
        return swf.length > 1 ? swf[swf.length - 1] : swf;
      }
    },
    // ## Event-handling
    events: {
      memoryLeaking: false,
      listeners: [],
      // **A simple cross-browser event handler abstraction**
      addListener: function(element, eventName, func) {
        // For modern browsers use the standard DOM-compliant `addEventListener`.
        if (element.addEventListener) {
          element.addEventListener(eventName, func, false);
          // For older versions of Internet Explorer, use `attachEvent`.  
          // Also provide a fix for scoping `this` to the calling element and register each listener so the containing elements can be purged on page unload.
        } else if (element.attachEvent) {
          this.listeners.push(element);
          if (!this.memoryLeaking) {
            window.attachEvent('onunload', function() {
              if(this.listeners) {
                for (var i = 0, ii = this.listeners.length; i < ii; i++) {
                  container[audiojs].events.purge(this.listeners[i]);
                }
              }
            });
            this.memoryLeaking = true;
          }
          element.attachEvent('on' + eventName, function() {
            func.call(element, window.event);
          });
        }
      },

      trackLoadProgress: function(audio) {
        // If `preload` has been set to `none`, then we don't want to start loading the track yet.
        if (!audio.settings.preload) return;

        var readyTimer,
            loadTimer,
            audio = audio,
            ios = (/(ipod|iphone|ipad)/i).test(navigator.userAgent);

        // Use timers here rather than the official `progress` event, as Chrome has issues calling `progress` when loading mp3 files from cache.
        readyTimer = setInterval(function() {
          if (audio.element.readyState > -1) {
            // iOS doesn't start preloading the mp3 until the user interacts manually, so this stops the loader being displayed prematurely.
            if (!ios) audio.init.apply(audio);
          }
          if (audio.element.readyState > 1) {
            if (audio.settings.autoplay) audio.play.apply(audio);
            clearInterval(readyTimer);
            // Once we have data, start tracking the load progress.
            loadTimer = setInterval(function() {
              audio.loadProgress.apply(audio);
              if (audio.loadedPercent >= 1) clearInterval(loadTimer);
            }, 200);
          }
        }, 200);
        audio.readyTimer = readyTimer;
        audio.loadTimer = loadTimer;
      },

      // **Douglas Crockford's IE6 memory leak fix**  
      // <http://javascript.crockford.com/memory/leak.html>  
      // This is used to release the memory leak created by the circular references created when fixing `this` scoping for IE. It is called on page unload.
      purge: function(d) {
        var a = d.attributes, i;
        if (a) {
          for (i = 0; i < a.length; i += 1) {
            if (typeof d[a[i].name] === 'function') d[a[i].name] = null;
          }
        }
        a = d.childNodes;
        if (a) {
          for (i = 0; i < a.length; i += 1) purge(d.childNodes[i]);
        }
      },

      // **DOMready function**  
      // As seen here: <https://github.com/dperini/ContentLoaded/>.
      ready: (function() { return function(fn) {
        var win = window, done = false, top = true,
        doc = win.document, root = doc.documentElement,
        add = doc.addEventListener ? 'addEventListener' : 'attachEvent',
        rem = doc.addEventListener ? 'removeEventListener' : 'detachEvent',
        pre = doc.addEventListener ? '' : 'on',
        init = function(e) {
          if (e.type == 'readystatechange' && doc.readyState != 'complete') return;
          (e.type == 'load' ? win : doc)[rem](pre + e.type, init, false);
          if (!done && (done = true)) fn.call(win, e.type || e);
        },
        poll = function() {
          try { root.doScroll('left'); } catch(e) { setTimeout(poll, 50); return; }
          init('poll');
        };
        if (doc.readyState == 'complete') fn.call(win, 'lazy');
        else {
          if (doc.createEventObject && root.doScroll) {
            try { top = !win.frameElement; } catch(e) { }
            if (top) poll();
          }
          doc[add](pre + 'DOMContentLoaded', init, false);
          doc[add](pre + 'readystatechange', init, false);
          win[add](pre + 'load', init, false);
        }
      }
      })()

    }
  }

  // ## The audiojs class
  // We create one of these per `<audio>` and then push them into `audiojs['instances']`.
  container[audiojsInstance] = function(element, settings) {
    // Each audio instance returns an object which contains an API back into the `<audio>` element.
    this.element = element;
    this.wrapper = element.parentNode;
    this.source = element.getElementsByTagName('source')[0] || element;
    // First check the `<audio>` element directly for a src and if one is not found, look for a `<source>` element.
    this.mp3 = (function(element) {
      var source = element.getElementsByTagName('source')[0];
      return element.getAttribute('src') || (source ? source.getAttribute('src') : null);
    })(element);
    this.settings = settings;
    this.loadStartedCalled = false;
    this.loadedPercent = 0;
    this.duration = 1;
    this.playing = false;
  }

  container[audiojsInstance].prototype = {
    // API access events:
    // Each of these do what they need do and then call the matching methods defined in the settings object.
    updatePlayhead: function() {
      var percent = this.element.currentTime / this.duration;
      this.settings.updatePlayhead.apply(this, [percent]);
    },
    skipTo: function(percent) {
      if (percent > this.loadedPercent) return;
      this.element.currentTime = this.duration * percent;
      this.updatePlayhead();
    },
    load: function(mp3) {
      this.loadStartedCalled = false;
      this.source.setAttribute('src', mp3);
      // The now outdated `load()` method is required for Safari 4
      this.element.load();
      this.mp3 = mp3;
      container[audiojs].events.trackLoadProgress(this);
    },
    loadError: function() {
      this.settings.loadError.apply(this);
    },
    init: function() {
      this.settings.init.apply(this);
    },
    loadStarted: function() {
      // Wait until `element.duration` exists before setting up the audio player.
      if (!this.element.duration) return false;

      this.duration = this.element.duration;
      this.updatePlayhead();
      this.settings.loadStarted.apply(this);
    },
    loadProgress: function() {
      if (this.element.buffered != null && this.element.buffered.length) {
        // Ensure `loadStarted()` is only called once.
        if (!this.loadStartedCalled) {
          this.loadStartedCalled = this.loadStarted();
        }
        var durationLoaded = this.element.buffered.end(this.element.buffered.length - 1);
        this.loadedPercent = durationLoaded / this.duration;

        this.settings.loadProgress.apply(this, [this.loadedPercent]);
      }
    },
    playPause: function() {
      if (this.playing) this.pause();
      else this.play();
    },
    play: function() {
      var ios = (/(ipod|iphone|ipad)/i).test(navigator.userAgent);
      // On iOS this interaction will trigger loading the mp3, so run `init()`.
      if (ios && this.element.readyState == 0) this.init.apply(this);
      // If the audio hasn't started preloading, then start it now.  
      // Then set `preload` to `true`, so that any tracks loaded in subsequently are loaded straight away.
      if (!this.settings.preload) {
        this.settings.preload = true;
        this.element.setAttribute('preload', 'auto');
        container[audiojs].events.trackLoadProgress(this);
      }
      this.playing = true;
      this.element.play();
      this.settings.play.apply(this);
    },
    pause: function() {
      this.playing = false;
      this.element.pause();
      this.settings.pause.apply(this);
    },
    setVolume: function(v) {
      this.element.volume = v;
    },
    trackEnded: function(e) {
      this.skipTo.apply(this, [0]);
      if (!this.settings.loop) this.pause.apply(this);
      this.settings.trackEnded.apply(this);
    }
  }

  // **getElementsByClassName**  
  // Having to rely on `getElementsByTagName` is pretty inflexible internally, so a modified version of Dustin Diaz's `getElementsByClassName` has been included.
  // This version cleans things up and prefers the native DOM method if it's available.
  var getByClass = function(searchClass, node) {
    var matches = [];
    node = node || document;

    if (node.getElementsByClassName) {
      matches = node.getElementsByClassName(searchClass);
    } else {
      var i, l, 
          els = node.getElementsByTagName("*"),
          pattern = new RegExp("(^|\\s)"+searchClass+"(\\s|$)");

      for (i = 0, l = els.length; i < l; i++) {
        if (pattern.test(els[i].className)) {
          matches.push(els[i]);
        }
      }
    }
    return matches.length > 1 ? matches : matches[0];
  };
// The global variable names are passed in here and can be changed if they conflict with anything else.
})('audiojs', 'audiojsInstance', this);

/* === audio-player.js === */
//////////////////////////////////////// --------------------------------------------------------//
//CONFIGURE PLAYER + AUTOPLAY NEXT SONG --------------------------------------------------------//
////////////////////////////////////// --------------------------------------------------------//
/*
var a = audiojs.createAll({
			trackEnded: function() {
				var playing = jQuery('.play-list-item-parent.playing'),
					next = playing.next();
	        
	        	if (!next.length > 0){
	        		var next = jQuery('.play-list-item-parent').first();
	        	} 
	        
	        	if (next.length > 0){
	        		next.click();
	        	} else {
	        		playing.removeClass('playing');
	        		checkPlayer();
	        	}
			}
		}),
	audio = a[0];
*/
window.audio = '';

	
	///////////////////////
	//AUDIO LINKING SYSTEM
	/////////////////////
	function GetURLParameter(sParam) {
		var results = new RegExp('[\?&]' + sParam + '=([^&#]*)').exec(window.location.href);
		
		if(results){
			return results[1] || 0;
		} else {
			return '';
		}
	}
		//VAR SETUP
		var audioId = (GetURLParameter('audio'))
				? GetURLParameter('audio')
				: '';
	
			// Explicitly save/update a url parameter using HTML5's replaceState().
			function updateQueryStringParam(param, value) {
			  baseUrl = [location.protocol, '//', location.host, location.pathname].join('');
			  urlQueryString = document.location.search;
			  var newParam = param + '=' + value,
			  params = '?' + newParam;
			
			  // If the "search" string exists, then build params from it
			  if (urlQueryString) {
			    keyRegex = new RegExp('([\?&])' + param + '[^&]*');
			    // If param exists already, update it
			    if (urlQueryString.match(keyRegex) !== null) {
			      params = urlQueryString.replace(keyRegex, "$1" + newParam);
			    } else { // Otherwise, add it to end of query string
			      params = urlQueryString + '&' + newParam;
			    }
			  }
			  window.history.replaceState({}, "", baseUrl + params);
			}
			
/////////////////
//EXPAND SUMMARY
///////////////
jQuery(document).on('click',"#sermon-details",function(){

	var sermonBar = jQuery('.sermon-bar');
	
	sermonBar.toggleClass('expanded');
	
	setTimeout(function(){ 
		jQuery('#sermon-summary-container .sermon-links > span:visible').first().addClass('first-link');
	}, 300);
});

			
///////////////// --------------------------------------------------------//
//ELLIPSIS CLICK --------------------------------------------------------//
/////////////// --------------------------------------------------------//
jQuery(document).on('click',".audio-download",function(e){
	
	e.stopPropagation();
	
	jQuery(".audio-download").not(this).removeClass('active-open').find('.download-content-parent').stop(true,true).slideUp(150);
	
	jQuery(this).toggleClass('active-open').find('.download-content-parent').stop(true,true).slideToggle(150);
	
	return false;
});

	jQuery(document).on('click',".download-content-parent a",function(e){
		
		e.stopPropagation();
		
	});
	
	
		//////////////
		//VIDEO CLICK
		////////////
		var videoOverlay = jQuery('#video-overlay.audio-video'),
			videoEmbedCon = videoOverlay.find('#inner-frame-container'),
			videoEmbedClose = videoOverlay.find('#video-close');
		
		jQuery(document).on('click',".view-video-recording, .sermon-player-video",function(e){
			
			e.stopPropagation();
			
			//PAUSE AUDIO
			jQuery('.playing.on').click();
			
			var videoLink = jQuery(this).data('embed');
					var videoId = videoLink.substring(videoLink.lastIndexOf('/') + 1);

			var videoEmbed = '<iframe src="https://player.vimeo.com/video/'+videoId+'" width="640" height="360" frameborder="0" allow="autoplay; fullscreen" allowfullscreen></iframe>';
			
			videoOverlay.stop(true,true).fadeIn(300,function(){
				theBody.addClass('video-playing');
			});
			videoEmbedCon.html(videoEmbed).find('*').not('iframe').remove();
			
			return false;
		});
			
			//CLOSE OVERLAY
			jQuery(document).on('click','#video-overlay.audio-video #video-close, #video-overlay.audio-video',function(){
				
				theBody.removeClass('video-playing');
				
				videoOverlay.stop(true,true).fadeOut(function(){
					videoEmbedCon.find('*').remove();
				});
				
				return false;
			});
			
			
///////////////////// --------------------------------------------------------//
//AUDIO PLAYER STUFF --------------------------------------------------------//
/////////////////// --------------------------------------------------------//
function checkPlayer(){
	var songPlaying = jQuery(".play-list-item-parent.playing");
	if(jQuery('#audiojs_wrapper0').hasClass('playing')){
		jQuery('#audiojs_wrapper0').removeClass('paused');
		songPlaying.addClass('on');
	} else {
		songPlaying.removeClass('on');
	} 
	
	//CLASS ADJUST
	jQuery('.first-link').removeClass('first-link');
	jQuery('.in-player .sermon-links > span:visible').first().addClass('first-link');
	jQuery('#sermon-summary-container .sermon-links > span:visible').first().addClass('first-link');
}	



////////////////// --------------------------------------------------------//
//LOAD FIRST SONG --------------------------------------------------------//
//////////////// --------------------------------------------------------//
function loadTrack(){
	var sermonBar = jQuery('.sermon-bar'),
		audioListItem = jQuery('.play-list-item-parent').first();
	
	//DETECT AUDIO LIST
	if(audioListItem.length > 0){
	
		//CHECK URL FOR AUDIO ID
		if(audioId !== ''){				

			var thisItem = jQuery('*[data-id="'+audioId+'"]'),
			 	thisId = thisItem.data('id'),
			 	thisAudio = thisItem.data('audio'),
				thisTitle = thisItem.data('title'),
				thisTeacher = thisItem.data('teacher'),
				thisImage = thisItem.data('image'),
				thisLesson = thisItem.data('lesson'),
				thisItunes = thisItem.data('itunes'),
				thisSpotify = thisItem.data('spotify'),
				thisVideo = thisItem.data('embed'),
				thisSummary = thisItem.find('.audio-summary > .ellipsed-text').html();
			
			//UPDATE SERMON BAR...
			(thisLesson !== '')
				? jQuery('.practice-span').show().find('.sermon-practice-link').attr('href',thisLesson)
				: jQuery('.practice-span').hide();
			(thisItunes !== '')
				? jQuery('.itunes-span').show().find('.sermon-itunes-link').attr('href',thisItunes)
				: jQuery('.itunes-span').hide();
			(thisSpotify !== '')
				? jQuery('.spotify-span').show().find('.sermon-spotify-link').attr('href',thisSpotify)
				: jQuery('.spotify-span').hide();
			(thisVideo !== '')
				? jQuery('.video-span').show().find('.sermon-player-video').data('embed',thisVideo)
				: jQuery('.video-span').hide();
	    	sermonBar.find('.sermon-image, .summary-image').attr('src',thisImage);
	    	sermonBar.find('.heading-3, .summary-heading').html(thisTitle);
	    	sermonBar.find('.sermon-text, .summary-sub-heading').html('By '+ thisTeacher);
	    	sermonBar.find('#sermon-summary-content').html(thisSummary);
	    	
	    	
	    	//LOAD AUDIO + CHECK PLAYER	   
	       	audio.load(thisAudio);
			checkPlayer(); 
			
			//UPDATE TRACK CLASS
			thisItem.addClass('playing');	
			
			//UPDATE URL
			updateQueryStringParam('audio', thisId);	
			
			//REMOVE NO AUDIO
			sermonBar.removeClass('no-audio');

		//LOAD FIRST TRACK IN LIST
		} else {
	
			var thisId = audioListItem.data('id'),
				thisAudio = audioListItem.data('audio'),
				thisTitle = audioListItem.data('title'),
				thisTeacher = audioListItem.data('teacher'),
				thisImage = audioListItem.data('image'),
				thisLesson = audioListItem.data('lesson'),
				thisItunes = audioListItem.data('itunes'),
				thisSpotify = audioListItem.data('spotify'),
				thisVideo = audioListItem.data('embed'),
				thisSummary = audioListItem.find('.audio-summary > .ellipsed-text').html();
			
			//UPDATE SERMON BAR...
				
				//LESSON
				(thisLesson !== '')
					? jQuery('.practice-span').show().find('.sermon-practice-link').attr('href',thisLesson)
					: jQuery('.practice-span').hide();
				
				//ITUNES
				(thisItunes !== '')
					? jQuery('.itunes-span').show().find('.sermon-itunes-link').attr('href',thisItunes)
					: jQuery('.itunes-span').hide();
				
				//SPOTIFY
				(thisSpotify !== '')
					? jQuery('.spotify-span').show().find('.sermon-spotify-link').attr('href',thisSpotify)
					: jQuery('.spotify-span').hide();
				
				//VIDEO
				(thisVideo !== '')
					? jQuery('.video-span').show().find('.sermon-player-video').data('embed',thisVideo)
					: jQuery('.video-span').hide();
		    	
		    	//IMAGE
		    	sermonBar.find('.sermon-image, .summary-image').attr('src',thisImage);
		    	
		    	//TITLE
		    	sermonBar.find('.heading-3, .summary-heading').html(thisTitle);
		    	
		    	//TEACHER
		    	sermonBar.find('.sermon-text, .summary-sub-heading').html('By '+ thisTeacher);
		    	
		    	//SUMMARY
		    	sermonBar.find('#sermon-summary-content').html(thisSummary);
	    	
	    	//LOAD AUDIO + CHECK PLAYER	   
	       	audio.load(thisAudio);
			checkPlayer();
			
			//UPDATE TRACK CLASS
			jQuery('.play-list-item-parent').first().addClass('playing');
			
			//UPDATE URL
			updateQueryStringParam('audio', thisId);
			
			//REMOVE NO AUDIO
			sermonBar.removeClass('no-audio');
		}
		
	//PLAY DEFAULT IN SERMON BAR
	} else if(sermonBar.length > 0 && !jQuery('#audiojs_wrapper0').hasClass('playing') && !jQuery('#audiojs_wrapper0').hasClass('paused')){
		
		var firstTrack = sermonBar.data('audio'),
			thisAudio = sermonBar.data('audio'),
			thisLesson = sermonBar.data('lesson'),
			thisItunes = sermonBar.data('itunes'),
			thisSpotify = sermonBar.data('spotify'),
			thisVideo = sermonBar.data('embed');
					
		//UPDATE SERMON BAR...
		if(thisLesson == ''){jQuery('.practice-span').hide();}
		if(thisItunes == ''){jQuery('.itunes-span').hide();}
		if(thisSpotify == ''){jQuery('.spotify-span').hide();}
		if(thisVideo == ''){jQuery('.video-span').hide();}
    	
    	//LOAD AUDIO + CHECK PLAYER	   
       	audio.load(thisAudio);
		checkPlayer();
	}
}



///////////////////////// --------------------------------------------------------//
//CLICKING SONG FUNCTION --------------------------------------------------------//
/////////////////////// --------------------------------------------------------//
jQuery(document).on('click',".play-list-item-parent",function(e){

	var sermonBar = jQuery('.sermon-bar'),
		thisTrack = jQuery(this),
		thisId = thisTrack.data('id'),
		thisAudio = thisTrack.data('audio'),
		thisTitle = thisTrack.data('title'),
		thisTeacher = thisTrack.data('teacher'),
		thisImage = thisTrack.data('image'),
		thisLesson = thisTrack.data('lesson'),
		thisItunes = thisTrack.data('itunes'),
		thisSpotify = thisTrack.data('spotify'),
		thisVideo = thisTrack.data('embed'),
		thisSummary = thisTrack.find('.audio-summary > .ellipsed-text').html();

	e.preventDefault();

	//PAUSE CURRENT
	if(thisTrack.hasClass('playing') && jQuery('#audiojs_wrapper0').hasClass('playing')){
		audio.pause();
		jQuery('#audiojs_wrapper0').addClass('paused');
		checkPlayer();
    
    //PLAY
    } else {
    	
    	//CURRENT
    	if(thisTrack.hasClass('playing')){
    		
    		audio.play();
    	
    	//LOAD NEW
    	} else {
    	
    		jQuery('.play-list-item-parent.playing').removeClass('playing');
    		thisTrack.addClass('playing');
    		audio.load(thisAudio);
    		audio.play();
    	}
    
    	//UPDATE SERMON BAR...
    	(thisLesson !== '')
			? jQuery('.practice-span').show().find('.sermon-practice-link').attr('href',thisLesson)
			: jQuery('.practice-span').hide();
		(thisItunes !== '')
			? jQuery('.itunes-span').show().find('.sermon-itunes-link').attr('href',thisItunes)
			: jQuery('.itunes-span').hide();
		(thisSpotify !== '')
			? jQuery('.spotify-span').show().find('.sermon-spotify-link').attr('href',thisSpotify)
			: jQuery('.spotify-span').hide();
		(thisVideo !== '')
			? jQuery('.video-span').show().find('.sermon-player-video').data('embed',thisVideo)
			: jQuery('.video-span').hide();
    	sermonBar.find('.sermon-image, .summary-image').attr('src',thisImage);
	    sermonBar.find('.heading-3, .summary-heading').html(thisTitle);
	    sermonBar.find('.sermon-text, .summary-sub-heading').html('By '+ thisTeacher);
    	sermonBar.find('#sermon-summary-content').html(thisSummary);
    	
    	//RUN FUNc
    	checkPlayer(); 
    }
    
    updateQueryStringParam('audio', thisId);
    
    //REMOVE NO AUDIO
	jQuery('.sermon-bar').removeClass('no-audio');
 });
 
 		//////////////////////
		// Keyboard shortcuts
		////////////////////
		jQuery(document).keydown(function(e) {
		      var unicode = e.charCode ? e.charCode : e.keyCode;
		        
		     //RIGHT ARROW
		     if (unicode == 39 && !jQuery("input,textarea").is(":focus")) {
		        
		     
		     //LEFT ARROW
		     } else if (unicode == 37 && !jQuery("input,textarea").is(":focus")) {
		        
		     
		     //UP ARROW
		     } else if (unicode == 38 && !jQuery("input,textarea").is(":focus")) {
			 	var prev = jQuery('.play-list-item-parent.playing').prev();
		        if (!prev.length > 0) { prev = jQuery('.play-list-item-parent').last(); }
		        prev.click();
		        return false;
		     
		     //DOWN ARROW
		     } else if (unicode == 40 && !jQuery("input,textarea").is(":focus")) {
		      	var next = jQuery('.play-list-item-parent.playing').next();
		        if (!next.length > 0) { next = jQuery('.play-list-item-parent').first(); }
		        next.click();
		        return false;
		     }
		});
    
/////////////////////////// --------------------------------------------------------//
//IF PLAY/PAUSE IS CLICKED --------------------------------------------------------// 
///////////////////////// --------------------------------------------------------//   
jQuery(document).on('click',".play-pause",function(){
    checkPlayer();
});

////////////////////// --------------------------------------------------------//
//IF PAUSE IS CLICKED --------------------------------------------------------//
//////////////////// --------------------------------------------------------//
jQuery(document).on('click',".play-pause .pause",function(){
    jQuery('#audiojs_wrapper0').addClass('paused');
    checkPlayer();
});

////////////// --------------------------------------------------------//
//IF NO SONGS --------------------------------------------------------//
//////////// --------------------------------------------------------//
/*
function showPlayer(){
	if(!jQuery('ol.songs').length > 0 && !jQuery('#audiojs_wrapper0').hasClass('playing') && !jQuery('#audiojs_wrapper0').hasClass('paused')){
		jQuery('.audiojs').slideUp(300);
	} else {
		jQuery('.audiojs').slideDown(300);
	}
}
showPlayer();
*/


////////////// --------------------------------------------------------//
//SONG TARGET --------------------------------------------------------//
//////////// --------------------------------------------------------//
//jQuery(".post a[data-src$='mp3']").addClass("song");


/////////////// --------------------------------------------------------//
//WINDOW STUFF --------------------------------------------------------//
///////////// --------------------------------------------------------//
jQuery(window).on('load',function(){
	
	//CONFIGURE PLAYER
	var a = audiojs.createAll({
			trackEnded: function() {
				var playing = jQuery('.play-list-item-parent.playing'),
					next = playing.next();
	        
	        	if (!next.length > 0){
	        		var next = jQuery('.play-list-item-parent').first();
	        	} 
	        
	        	if (next.length > 0){
	        		next.click();
	        	} else {
	        		playing.removeClass('playing');
	        		checkPlayer();
	        	}
			}
		});
		
		window.audio = a[0];
	
		loadTrack();
	
	jQuery('.play-pause .play').html('<i class="fas fa-play"></i>');
	jQuery('.play-pause .pause').html('<i class="fas fa-pause"></i>');
	jQuery('.play-pause .loading').html('<i class="far fa-spinner-third fa-spin"></i>');
	jQuery('.play-pause .error').html('<i class="fas fa-exclamation"></i>');
});



/* === custom.js === */
//////////// ------------------------------------------------------//
//VAR SETUP ------------------------------------------------------//
////////// ------------------------------------------------------//
var theDocument = jQuery(document),
	theWindow = jQuery(window),
		windowHeight = theWindow.outerHeight(),
	theBody = jQuery('body'),
	theHTML = jQuery('html, body');
	
	var windowWidth = theWindow.width();
	
	//HOME ELEMENTS
	var navBar = jQuery('#navbar'),
		mainHero = jQuery('#page-hero'),
			mainHeroBackground = jQuery('#page-hero-background'),
		heroContent = jQuery('#page-hero-content'),
		sermonBar = jQuery('.sermon-bar'),
		navLink = jQuery('.nav-link'),
		
		flexHero = jQuery('.flex-row-hero'),
		storiesGrid = jQuery('.stories-grid');
		
	var cutOut = jQuery('.cut-out'),
		footer = jQuery('footer');
		
	//VIDEO EMBED OVERLAY
	var headerVideoLink = jQuery('#header-video'),
			videoEmbed = headerVideoLink.data('embed'),
		videoOverlay = jQuery('#video-overlay'),
		videoEmbedCon = jQuery('#inner-frame-container'),
		videoEmbedClose = jQuery('#video-close');
		
		
	//MENU STUFF
	var menuToggle = jQuery('#menu-toggle'),
		navMenu = jQuery('.nav-menu');


	//STAFF 
	var staffScrollList = jQuery('.slider-staff .staff-listing'),
		staffScrollItem = jQuery('.staff-post'),
		staffScrollButton = jQuery('.staff-scroll');
		
			//SWIPE SETUP
			staffScrollList.on( "swipeleft", swipeleftStaff );
			staffScrollList.on( "swiperight", swiperightStaff );
			  function swipeleftStaff( event ){
			  	if(jQuery('.active-staff').next().length > 0 ){
			  		jQuery('.active-staff').next().click();
			  	}
			  }
			  function swiperightStaff( event ){
			    if(jQuery('.active-staff').prev().length > 0 ){
			  		jQuery('.active-staff').prev().click();
			  	}
			  }
		
	//STORIES
	var storiesScrollList = jQuery('.blog-slider'),
		storiesScrollItem = jQuery('.blog-slide'),
		storiesScrollButton = jQuery('.post-scroll');
		
			//SWIPE SETUP
			storiesScrollList.on( "swipeleft", swipeleftPost );
			storiesScrollList.on( "swiperight", swiperightPost );
			  function swipeleftPost( event ){
			  	if(jQuery('.active-post').next().length > 0 ){
			  		jQuery('.active-post').next().click();
			  	}
			  }
			  function swiperightPost( event ){
			    if(jQuery('.active-post').prev().length > 0 ){
			  		jQuery('.active-post').prev().click();
			  	}
			  }
		
	//EVENT 
	var eventScrollList = jQuery('.slider-event .event-listing'),
		eventScrollItem = jQuery('.calendar-event'),
		eventScrollButton = jQuery('.event-scroll');
		
			//SWIPE SETUP
			eventScrollList.on( "swipeleft", swipeleftEvent );
			eventScrollList.on( "swiperight", swiperightEvent );
			  function swipeleftEvent( event ){
			  	if(jQuery('.active-event').next().length > 0 ){
			  		jQuery('.active-event').next().click();
			  	}
			  }
			  function swiperightEvent( event ){
			    if(jQuery('.active-event').prev().length > 0 ){
			  		jQuery('.active-event').prev().click();
			  	}
			  }

	//LOCATION
	var locationScrollList = jQuery('.location-listing'),
		locationScrollItem = jQuery('.location-slide'),
		locationScrollControls = jQuery('#location-scroll');
		
			//SWIPE SETUP
			locationScrollList.on( "swipeleft", swipeleftLoc );
			locationScrollList.on( "swiperight", swiperightLoc );
			  function swipeleftLoc( event ){
			  	if(jQuery('.active-location').next().length > 0 ){
			  		jQuery('.active-location').next().click();
			  	}
			  }
			  function swiperightLoc( event ){
			    if(jQuery('.active-location').prev().length > 0 ){
			  		jQuery('.active-location').prev().click();
			  	}
			  }
  
  
 //MENU DEAD LINK INDICATOR
 jQuery('.mega-sub-menu .mega-menu-link[href="#"]').css({'opacity':'.45'});
 
 
 
//////////////////// ------------------------------------------------------//
//LINK ANCHOR CHECK ------------------------------------------------------//
////////////////// ------------------------------------------------------//
theDocument.on('click','li.mega-menu-item a.mega-menu-link', function(){
	
    var current = window.location.href.split('#')[0],
    	goto = jQuery(this).attr('href').split('#')[0];
	
    if (current == goto && this.hash) {
        theBody.removeClass('main-menu-open');
		navMenu.stop(true,true).slideUp(300);
    }
});
  
  
/////////////////// ------------------------------------------------------//
//SEARCH BAR STUFF ------------------------------------------------------//
///////////////// ------------------------------------------------------//
var searchBox = jQuery('#search-box'),
	searchInput = searchBox.find('input'),
	searchButton = jQuery('.tab-nav-container .search-icon');

theDocument.on('click','.tab-nav-container .search-icon', function(){
	
	if(!searchBox.hasClass('open')){
		
		searchBox.addClass('open');
		searchButton.addClass('open');
		
		searchInput.val('').focus();
	
	} else if(searchBox.hasClass('open')) {
	
		searchBox.removeClass('open');
		searchButton.removeClass('open');
	}
	
	return false;
});

	
///////////////// ------------------------------------------------------//
//STORIES SLIDER ------------------------------------------------------//
/////////////// ------------------------------------------------------//
theDocument.on('click','.post-scroll', function(){

	storiesScrollButton.removeClass('active-post');
	
	var thisButton = jQuery(this),
		thisId = thisButton.attr('id'),
		itemWidth = storiesScrollItem.outerWidth();
	
	if(thisId == 'post-scroll-1'){
	
		storiesScrollList.animate({scrollLeft: '0'}, 350);
	
	} else if(thisId == 'post-scroll-2'){	
	
		storiesScrollList.animate({scrollLeft: itemWidth}, 350);
	
	} else if(thisId == 'post-scroll-3'){
		
		storiesScrollList.animate({scrollLeft: 1300}, 350);
	}
	
	thisButton.addClass('active-post');
});


////////////////// ------------------------------------------------------//
//LOCATION SLIDER ------------------------------------------------------//
//////////////// ------------------------------------------------------//
function locationScroll(){

	jQuery('.scroll-to-here').removeClass('scroll-to-here');
	jQuery('.location-scroll').remove();

	if(locationScrollList.length > 0){
		
		if(theWindow.width() < 1000) {
			//ADD CLASS
			jQuery('.location-slide:even').addClass('scroll-to-here');
		
		} else {
			//ADD CLASS
			jQuery('.location-slide:nth-child(5n+1)').addClass('scroll-to-here');
		}
		
		//SET OFFSET DATA
		locationScrollItem.each(function(index){
		
			var thisItem = jQuery(this),
				thisOffset = thisItem.offset().left - 25;
				
			thisItem.data('offset',thisOffset+'px');
		});
		
		//APPEND SCROLL BUTTON
		if(jQuery('.location-scroll').length < 1){

			jQuery('.scroll-to-here').each(function(){
			
				var thisSlide = jQuery(this),
					thisIndex = thisSlide.index(),
					className = (thisIndex == 0)
						? ' active-location'
						: '';
				
				locationScrollControls.append('<div data-index="'+thisIndex+'" class="location-scroll'+className+'"></div>');
			});
		}
	}
}
	//CLICK
	theDocument.on('click','.location-scroll', function(){
		
		//REMOVE CLASS
		jQuery('.location-scroll').removeClass('active-location');
	
		//VAR SETUP
		var thisButton = jQuery(this),
			thisIndex = thisButton.data('index'),
			activeSlide = jQuery('.location-slide:eq('+thisIndex+')'),
			itemLeftPos = activeSlide.data('offset');
		
		//SCROLL CONTAINER
		locationScrollList.animate({scrollLeft: itemLeftPos}, 350);
		
		//CLASS UPDATE
		thisButton.addClass('active-location');
	});
		
		
/////////////// ------------------------------------------------------//
//EVENT SLIDER ------------------------------------------------------//
///////////// ------------------------------------------------------//
theDocument.on('click','.event-scroll', function(){

	eventScrollButton.removeClass('active-event');
	
	var thisButton = jQuery(this),
		thisId = thisButton.attr('id'),
		itemWidth = eventScrollItem.outerWidth();
	
	if(thisId == 'event-scroll-1'){
	
		eventScrollList.animate({scrollLeft: '0'}, 350);
	
	} else if(thisId == 'event-scroll-2'){	
	
		eventScrollList.animate({scrollLeft: itemWidth}, 350);
	
	} else if(thisId == 'event-scroll-3'){
		
		eventScrollList.animate({scrollLeft: (itemWidth * 2)}, 350);
	}
	
	thisButton.addClass('active-event');
});


/////////////// ------------------------------------------------------//
//STAFF SLIDER ------------------------------------------------------//
///////////// ------------------------------------------------------//
theDocument.on('click','.staff-scroll', function(){

	staffScrollButton.removeClass('active-staff');
	
	var thisButton = jQuery(this),
		thisId = thisButton.attr('id'),
		itemWidth = staffScrollItem.outerWidth();
	
	if(thisId == 'staff-scroll-1'){
	
		staffScrollList.animate({scrollLeft: '0'}, 350);
	
	} else if(thisId == 'staff-scroll-2'){	
	
		staffScrollList.animate({scrollLeft: itemWidth}, 350);
	
	} else if(thisId == 'staff-scroll-3'){
		
		staffScrollList.animate({scrollLeft: (itemWidth * 2)}, 350);
	}
	
	thisButton.addClass('active-staff');
});


///////////////////// ------------------------------------------------------//
//FILTER HOVER STUFF ------------------------------------------------------//
/////////////////// ------------------------------------------------------//

//TITLE HOVER
jQuery('.audio-title-filter').hover(function(){

	jQuery('.audio-title').addClass('filter-check');

},function(){

	jQuery('.audio-title').removeClass('filter-check');
});

//TEACHER HOVER
jQuery('.audio-teacher-filter').hover(function(){

	jQuery('.audio-teacher').addClass('filter-check');

},function(){

	jQuery('.audio-teacher').removeClass('filter-check');
});

//SUMMARY HOVER
jQuery('.audio-summary-filter').hover(function(){

	jQuery('.audio-summary').addClass('filter-check');

},function(){

	jQuery('.audio-summary').removeClass('filter-check');
});

//DATE HOVER
jQuery('.audio-date-filter').hover(function(){

	jQuery('.audio-date').addClass('filter-check');

},function(){

	jQuery('.audio-date').removeClass('filter-check');
});

//DURATION HOVER
jQuery('.audio-duration-filter').hover(function(){

	jQuery('.audio-duration').addClass('filter-check');

},function(){

	jQuery('.audio-duration').removeClass('filter-check');
});



////////////////////// ------------------------------------------------------//
//FILTER SCROLL CHECK ------------------------------------------------------//
//////////////////// ------------------------------------------------------//
/*
function filterScroll(){
	
	if(vidLayout.length > 0){
	
		filterPos = vidLayout.offset().top;
		scrollPos = theDocument.scrollTop();
			
		(filterPos <= scrollPos)
			? theBody.addClass('fixed-filter')
			: theBody.removeClass('fixed-filter');
	}
}
filterScroll();
*/

/////////////// ------------------------------------------------------//
//FILTER CLICK ------------------------------------------------------//
///////////// ------------------------------------------------------//
var audioList = jQuery('.overflow-player-section'),
	audioItem = jQuery('.play-list-item-parent');

theDocument.on('click','.audio-filter .filter-link', function(){
		
	var //filterPos = vidLayout.offset().top,
		//scrollPos = theDocument.scrollTop(),
		thisFilter = jQuery(this),
		thisID = thisFilter.attr('id');
		
	//SCROLL TO TOP
	/*
	if(jQuery('.active-filter').length > 0 && filterPos < scrollPos){
	
		(theBody.hasClass('open-sidebar') || theBody.hasClass('open-chat') || theBody.hasClass('open-comments') || theBody.hasClass('open-products'))
			? everyThing.stop().animate({scrollTop:filterPos}, '600')
			: theHTML.stop().animate({scrollTop:filterPos}, '600');
	}
	*/

	///////
	//TITLE 
	///////
	if(thisID == 'audio-title-filter'){
	
		//ASC
		if(thisFilter.hasClass('desc')){
			
			thisFilter.removeClass('desc').addClass('asc');
			
			audioItem.sort(function(a,b){
				var an = a.getAttribute('data-title'),
					bn = b.getAttribute('data-title');
			
				if(an > bn) {
					return -1;
				}
				if(an < bn) {
					return 1;
				}
				
				return 0;
			});
			
		//DESC	
		} else {
		
			//CLASS SWAP
			jQuery('.audio-filter .filter-link').removeClass('desc').removeClass('asc');
			thisFilter.addClass('desc');
			
			audioItem.sort(function(a,b){
				var an = a.getAttribute('data-title'),
					bn = b.getAttribute('data-title');
			
				if(an < bn) {
					return -1;
				}
				if(an > bn) {
					return 1;
				}
				
				return 0;
			});
		}
		
		//LOAD LIST
		audioItem.detach().appendTo(audioList);
		

	////////
	//TEACHER 
	////////
	} else if(thisID == 'audio-teacher-filter'){
	
		//ASC
		if(thisFilter.hasClass('desc')){
			
			thisFilter.removeClass('desc').addClass('asc');
			
			audioItem.sort(function(a,b){
				var an = a.getAttribute('data-teacher'),
					bn = b.getAttribute('data-teacher');
			
				if(an > bn) {
					return -1;
				}
				if(an < bn) {
					return 1;
				}
				
				return 0;
			});
			
		//DESC	
		} else {
		
			//CLASS SWAP
			jQuery('.audio-filter .filter-link').removeClass('desc').removeClass('asc');
			thisFilter.addClass('desc');
			
			audioItem.sort(function(a,b){
				var an = a.getAttribute('data-teacher'),
					bn = b.getAttribute('data-teacher');
			
				if(an < bn) {
					return -1;
				}
				if(an > bn) {
					return 1;
				}
				
				return 0;
			});
		}
		
		//LOAD LIST
		audioItem.detach().appendTo(audioList);
		
	//////////
	//SUMMARY
	////////
	} else if(thisID == 'audio-summary-filter'){
	
		//ASC
		if(thisFilter.hasClass('desc')){
		
			//CLASS SWAP
			thisFilter.removeClass('desc').addClass('asc');

			audioItem.sort(function(a,b){
				var an = a.getAttribute('data-summary'),
					bn = b.getAttribute('data-summary');
				
				if(an > bn) {
					return -1;
				}
				if(an < bn) {
					return 1;
				}
				
				return 0;
			});
		
		//DESC
		} else {
			
			//CLASS SWAP
			jQuery('.audio-filter .filter-link').removeClass('desc').removeClass('asc');
			thisFilter.addClass('desc');

			audioItem.sort(function(a,b){
				var an = a.getAttribute('data-summary'),
					bn = b.getAttribute('data-summary');
				
				if(an < bn) {
					return -1;
				}
				if(an > bn) {
					return 1;
				}
				
				return 0;
			});
		}
		
		//LOAD LIST
		audioItem.detach().appendTo(audioList);
	
	///////
	//DATE	
	/////
	} else if(thisID == 'audio-date-filter'){
	
		//ASC
		if(thisFilter.hasClass('desc')){
		
			//CLASS SWAP
			thisFilter.removeClass('desc').addClass('asc');
			
			audioItem.sort(function(a,b){
				var an = a.getAttribute('data-date'),
					bn = b.getAttribute('data-date');
			
				return an - bn;
			});
			
		//DESC
		} else {
			
			//CLASS SWAP
			jQuery('.audio-filter .filter-link').removeClass('desc').removeClass('asc');
			thisFilter.addClass('desc');
		
			audioItem.sort(function(a,b){
				var an = a.getAttribute('data-date'),
					bn = b.getAttribute('data-date');
			
				return bn - an;
			});
		}
		
		//LOAD LIST
		audioItem.detach().appendTo(audioList);
		
	///////////
	//DURATION
	/////////
	} else if(thisID == 'audio-duration-filter'){
	
		//ASC
		if(thisFilter.hasClass('desc')){
		
			//CLASS SWAP
			thisFilter.removeClass('desc').addClass('asc');
			
			audioItem.sort(function(a,b){
				var an = a.getAttribute('data-duration'),
					bn = b.getAttribute('data-duration');
			
				return an - bn;
			});
			
		//DESC
		} else {
			
			//CLASS SWAP
			jQuery('.audio-filter .filter-link').removeClass('desc').removeClass('asc');
			thisFilter.addClass('desc');
		
			audioItem.sort(function(a,b){
				var an = a.getAttribute('data-duration'),
					bn = b.getAttribute('data-duration');
			
				return bn - an;
			});
		}
		
		//LOAD LIST
		audioItem.detach().appendTo(audioList);
	
	}

	
	////////////
	//CLASS SWAP
	////////////
	jQuery('.audio-filter .filter-link').removeClass('active-audio-filter');
	thisFilter.addClass('active-audio-filter');
	
	return false;
});




//////////////////// ------------------------------------------------------//
//MENU COLOR ADJUST ------------------------------------------------------//
////////////////// ------------------------------------------------------//
if(mainHero.length == 0){
	
	navBar.addClass('solid-nav');
}


////////////// ------------------------------------------------------//
//MENU TOGGLE ------------------------------------------------------//
//////////// ------------------------------------------------------//
menuToggle.click(function(){

	theBody.toggleClass('main-menu-open');
	
	theBody.hasClass('main-menu-open')
		? navMenu.stop(true,true).slideDown(300)
		: navMenu.stop(true,true).slideUp(300);
});



///////////////////// ------------------------------------------------------//
//HEADER VIDEO CLICK ------------------------------------------------------//
/////////////////// ------------------------------------------------------//
headerVideoLink.click(function(){

	videoOverlay.stop(true,true).fadeIn(300,function(){
		theBody.addClass('video-playing');
	});
	videoEmbedCon.html(videoEmbed).find('*').not('iframe').remove();
	
	return false;
});

	//CLOSE OVERLAY
	theDocument.on('click','#video-close, #video-overlay',function(){
		
		theBody.removeClass('video-playing');
		
		videoOverlay.stop(true,true).fadeOut(function(){
			videoEmbedCon.find('*').remove();
		});
		
		return false;
	});



//////////////// ------------------------------------------------------//
//CUT OUT STUFF -- block inside footer
////////////// ------------------------------------------------------//
function cutOutFooter(){		

	if(cutOut.length > 0){
	
		//RESET
		cutOut.css({'marginBottom' : '8%'});
		
		var cutOutHeight = cutOut.outerHeight(true);
		
		//CSS ADJUST
		cutOut.css({'marginBottom' : '-' + cutOutHeight + 'px'});
		footer.css({'paddingTop' : (cutOutHeight + 350) + 'px', 'paddingBottom' : '50px'});
	}
}
	//RUN FUNC
	cutOutFooter();


////////////////////// ------------------------------------------------------//
//SET UNDERLINE WIDTH ------------------------------------------------------//
//////////////////// ------------------------------------------------------//
function underlineWidth(){

	jQuery('.underline').each(function(){
		
		var thisItem = jQuery(this);
		
		thisItem.css({'max-width':'auto'});
		
		var thisWidth = thisItem.outerWidth() + 'px';

		thisItem.css({'max-width':'0', 'background-size' : thisWidth});
		this.style.setProperty('--underline-width', thisWidth);
	});
}
	//RUN FUNCTION
	underlineWidth();


///////////// ------------------------------------------------------//
//MENU HOVER ------------------------------------------------------// 
/////////// ------------------------------------------------------//
navBar.on('mouseover',function(){
	
	navBar.addClass('solid-nav');	
});



/////////////////////// ------------------------------------------------------//
//UPDATE BUTTON MARKUP ------------------------------------------------------//
///////////////////// ------------------------------------------------------//
jQuery('#hero-sub-title p a, .gold-text-link, .series-back-link, nav .textwidget a, #main p a.gold').wrapInner('<span></span>');




////////////// ------------------------------------------------------//
//MENU SCROLL - menuScroll()
//////////// ------------------------------------------------------//
var scrolled = 0;
function menuScroll(){

	//VAR SETUP
	var scrollbar = theDocument.scrollTop();
	
	//ASSIGN hideMenu CLASS
	//if(scrolled < scrollbar && (windowHeight / 2) <= scrollbar) {
	if(scrolled < scrollbar && 200 <= scrollbar) {
		window.scrolled = scrollbar;
		theBody.addClass('hideMenu');
		
	} else {
		window.scrolled = scrollbar;
		theBody.removeClass('hideMenu');
		
	}	
}
	//RUN FUNCTION
	menuScroll();




///////////////////// ------------------------------------------------------//		
//SHOW OVERFLOW TEXT -- overflowCheck()
/////////////////// ------------------------------------------------------//	
function overflowCheck(){

	jQuery('.overflow-scroll').removeClass('overflow-scroll');

	jQuery('.teacher-ellipsis, .ellipsed-text, .sermon-content h5').each(function(){
		var showThis = jQuery(this),
			thisScrollWidth = showThis[0].scrollWidth,
			parentWidth = showThis.parent().width();
		
		if(thisScrollWidth > (parentWidth - 90)) {	
			
			showThis.addClass('overflow-scroll');
			
		} else {
			
			showThis.removeClass('overflow-scroll');
		}
	});
}
	//RUN FUNCTION
	overflowCheck();

	//DESKTOP HOVER
	jQuery(theDocument).on({
	    mouseenter: function(){
	        var showThis = jQuery(this),
				thisScrollWidth = showThis[0].scrollWidth,
				parentWidth = showThis.parent().width(),
				spaceNeeded = thisScrollWidth - (parentWidth - 50),
					scrollSpeed = (spaceNeeded < 300)
									? spaceNeeded * 25
									: spaceNeeded * 15;		
			
			showThis.addClass('active-scroll').stop(true,true).animate({textIndent:"-"+spaceNeeded+"px"},scrollSpeed);
	    },
	    mouseleave: function(){
	        jQuery(this).removeClass('active-scroll').stop(true,true).css({textIndent:"0"});
	    }
	}, '.overflow-scroll');




//////////////// ------------------------------------------------------//
//SCROLL REVEAL ------------------------------------------------------//
////////////// ------------------------------------------------------//
function scrollReveal(){

	var scrollBar = theDocument.scrollTop(),
		revealItem = jQuery('.reveal-item').not('.revealed');
		
	revealItem.each(function(){
		
		var thisItem = jQuery(this),
			offsetTop = thisItem.offset().top;
		
		if(offsetTop < (scrollBar + (windowHeight - 50))){
			
			thisItem.addClass('revealed');
		}
	});
}
	//SET REVEAL ITEMS
	jQuery('#main > *').not('#page-hero').addClass('reveal-item');


/////////////////////////// ------------------------------------------------------//
//NEWSLETTER POP-UP SUBMIT ------------------------------------------------------//
///////////////////////// ------------------------------------------------------//
jQuery('#mailchimp').submit(function() {

	var mailChimpEmail = jQuery('#mailchimp-email'),
		taglineHtml = jQuery('#mailchimp-tagline').html();

	if(mailChimpEmail.val() == ''){
		
		mailChimpEmail.addClass('required-field').focus();
	
		return false;		
	
	} else {
	
		mailChimpEmail.removeClass('required-field');
	}

	if(theBody.hasClass('form-loading')){
		return false;
	}
	
	var pageUrl = window.location.href;
	
	//LOADING NOTICE
	theBody.addClass('form-loading');
		
	//POST FORM
	jQuery.post(pageUrl, jQuery('#mailchimp').serialize(), function() {
        
        theBody.removeClass('form-loading').addClass('form-loaded');
		jQuery('#mailchimp-tagline').html('Thank you! Your email has been added to the list!');	
        
        //HIDE FORM
        setTimeout(function(){
        
        	theBody.removeClass('form-loaded');
        	
        },1500);
        
        //RESET INPUTS
        setTimeout(function(){
        	
        	mailChimpEmail.val('').show();	
        	jQuery('#mailchimp-tagline').html(taglineHtml);	
        	
        },2500);        
    });
    
    return false;
});


/////////////// ------------------------------------------------------//
//WINDOW STUFF ------------------------------------------------------//
///////////// ------------------------------------------------------//
theWindow.on('resize',function(){

	//VAR UPDATE
	window.windowHeight = theWindow.outerHeight();

	//RUN FUNCTIONs
	overflowCheck();
	underlineWidth();
	cutOutFooter();
	//locationScroll();
	
	if(theWindow.width() !== windowWidth){
	
		if(storiesScrollList.length > 0){
			storiesScrollList.scrollLeft(0);
			storiesScrollButton.removeClass('active-post').first().addClass('active-post');
		}
		if(staffScrollList.length > 0){
			staffScrollList.scrollLeft(0);
			staffScrollButton.removeClass('active-staff').first().addClass('active-staff');
		}
		if(eventScrollList.length > 0){
			eventScrollList.scrollLeft(0);
			eventScrollButton.removeClass('active-event').first().addClass('active-event');
		}
		if(locationScrollList.length > 0){
			locationScrollList.scrollLeft(0);
			jQuery('.location-scroll').removeClass('active-location').first().addClass('active-location');
			locationScroll();
		}
	}
	
	//VAR UPDATE
	window.windowWidth = theWindow.width();
	
}).on('load',function(){

	//VAR SETUP
	window.scrollTop = theDocument.scrollTop();

	//VAR UPDATE
	window.windowWidth = theWindow.width();
	
	//REMOVE LOADING NOTICE
	jQuery('#page-loading').stop(true,true).fadeOut(500);
	
	//CLASS UPDATE
	theBody.addClass('loading');
		
		//CLASS UPDATE
		setTimeout(function(){ 
			theBody.removeClass('loading').addClass('loaded');
		}, 3000);
		
	//RUN FUNCTIONs
	overflowCheck();
	scrollReveal();
	cutOutFooter();
	
	if(storiesScrollList.length > 0){
		storiesScrollList.scrollLeft(0);
	}
	if(staffScrollList.length > 0){
		staffScrollList.scrollLeft(0);
	}
	if(eventScrollList.length > 0){
		eventScrollList.scrollLeft(0);
	}
	if(locationScrollList.length > 0){
		locationScroll();
		locationScrollList.scrollLeft(0);
	}
			
}).on('scroll',function(){
	
	//VAR SETUP
	var scrollTop = theDocument.scrollTop();
	
	//CLASS UPDATE
	scrollTop > 5
		? theBody.addClass('short-nav')
		: theBody.removeClass('short-nav');
	
	//RUN FUNCs
	menuScroll();
	
	//SCROLL REVEAL
	setTimeout(function(){ 
		scrollReveal();
	}, 100);
	
	
	//PARALLAX
	if(mainHero.length > 0 && mainHero.hasClass('parallax-on')){
	
		var scrollCalc = scrollTop * .35,
			scrollCalc2 = scrollTop * .5,
			
			scrollPercent = scrollTop / windowHeight;
				
		mainHeroBackground.css({
			'transform': 'translate3d(0, ' +scrollCalc + 'px, 0)'
		});
		heroContent.css({
			'transform': 'translate3d( 0, '+ scrollCalc2 +'px, 0 )', 
			'opacity':1 - (scrollPercent * 1.1)
		});
	}	
});