/*--------------------------------------------------------------
Draggable
alternative to jQuery UI’s draggable
based on comments from: http://css-tricks.com/snippets/jquery/draggable-without-jquery-ui/
usage example: $('.post-thumbnail, article header').draggable();

Modified from: https://gist.github.com/Arty2/11199162
but this looks good too: http://jsbin.com/vuhasika/1/edit
--------------------------------------------------------------*/
(function($) {
  if (!jQuery().draggable) {
    $.fn.draggable = function() {
      this.css('cursor', 'move').on('mousedown touchstart', function(e) {

        var $dragged = $(this);
        var x = $dragged.offset().left - e.pageX,
            y = $dragged.offset().top - e.pageY,
            z = $dragged.css('z-index');

        if (!$.fn.draggable.stack) {
          $.fn.draggable.stack = 999;
        }
            
        stack = $.fn.draggable.stack;
                
        $(window).on('mousemove.draggable touchmove.draggable', function(e) {

          var faderEl = $(e.target).parents('.slider');

          if (typeof $(faderEl).offset() !== 'undefined') {

            var relativeY = $($dragged).offset().top - $(faderEl).offset().top;
            console.log('relativeY', relativeY)

            var faderTopPos = $(faderEl).offset().top; // should be + 1/2 the fader's height
            console.log('faderTopPos', faderTopPos);
            
            var faderBottomPos = $(faderEl).offset().top + $(faderEl).height();
            console.log('faderBottomPos', faderBottomPos);
            
            var pageY = e.pageY;

            if (pageY < faderBottomPos && pageY > faderTopPos ) {

              $dragged
                .css({'z-index': stack, 'transform': 'scale(1.0)', 'transition': 'transform .3s', 'bottom': 'auto', 'right': 'auto'})
                .offset({
                    // left: x + e.pageX,
                    top: y + e.pageY
                })
                .find('a').one('click.draggable', function(e) {
                    e.preventDefault();
                });

            }

          }
          e.preventDefault();
        }).one('mouseup touchend touchcancel', function() {

          $(this).off('mousemove.draggable touchmove.draggable click.draggable');
          $dragged.css({'z-index': stack, 'transform': 'scale(1)'})
          $.fn.draggable.stack++;

        });

        e.preventDefault();

      });

      return this;
    };
  }
})(jQuery);