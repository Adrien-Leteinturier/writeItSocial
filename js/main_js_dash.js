$(document).ready(function(){


/* Scroll Animation */
//Element top//
var elementChat = $('#chat-block');
var topChat = $('#chat-block').offset().top;

var fixedElement = function(elementTop,element){
    $(window).scroll(function() {

	var scrollTop = $(window).scrollTop();
	var windowHeight = $(window).height();
    console.log(scrollTop)

	if (scrollTop + 100 > elementTop) {
        console.log('yep')
        $(element).addClass('is_stuck');
	} 
    if (scrollTop < windowHeight){
        console.log('yep stop')
        $(element).removeClass('is_stuck');
    }
    });
};
fixedElement(topChat,elementChat);

});            

