$(document).ready(function(){


/* Scroll Animation */
//Element top//
var elementChat = $('#chat-block');
var topChat = $('#chat-block').offset().top;


var fixedElement = function(elementTop,element){
    $(window).scroll(function() {

	var scrollTop = $(window).scrollTop();
	var windowHeight = $(window).height();


	if (scrollTop + 100 > elementTop) {
        $(element).addClass('is_stuck');
	} 
    if (scrollTop < windowHeight){
        $(element).removeClass('is_stuck');
    }
    });
};
fixedElement(topChat,elementChat);

});            

