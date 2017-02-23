$(document).ready(function(){


    // EVENT SUBMIT BUTTON FORM POST //
    $( '.button-submit-post' ).click(function() {
    $( '#form-create-post' ).submit();
    }); 
    // EVENT SUBMIT BUTTON FORM POST ENDS //

    // CLICK ICON MODIFY POST //
    
    var hideShowForm = function(clicElement,targetElement){
        $(targetElement).hide();
        $(clicElement).click(function(){
            $(targetElement).show('slow');
        })
    }
    hideShowForm($('.modify'),$('.post-modify-post'))

    // CLICK ICON MODIFY POST ENDS //

    // EVENT SUBMIT BUTTON MODIFY FORM POST //
    $( '.button-modify-post' ).click(function() {
        $( '.post-modify-post' ).submit();
    }); 
    // EVENT SUBMIT BUTTON MODIFY FORM POST ENDS //


});

