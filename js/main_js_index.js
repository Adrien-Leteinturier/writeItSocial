$(document).ready(function(){
    /* Scroll Animation */
    //Element top//
    var topNum = $('.num').offset().top;
    var topFeatures = $('#features').offset().top;
    //Element Anim//
    var AnimFeatures = $('.feature-item,.feature-icon');
    var AnimMap = $('.mapImageProfil');
    var scrollAction = function(elementTop,elementAnim){
        $(window).scroll(function() {

        var scrollTop = $(window).scrollTop();
        var windowHeight = $(window).height();

        if (windowHeight + scrollTop > elementTop) {
            elementAnim.animate({
                opacity: 1
            }, 2000, function() {
            // Animation complete.
            });        
        } 
        });
    };
    scrollAction(topFeatures,AnimFeatures);
    scrollAction(topNum,AnimMap);
});