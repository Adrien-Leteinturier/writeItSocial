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
    hideShowForm($('.post-modify-post'),$('.modify'))

    // CLICK ICON MODIFY POST ENDS //

    // EVENT SUBMIT BUTTON MODIFY FORM POST //
    $( '.button-modify-post' ).click(function() {
        $( '.post-modify-post' ).submit();
    }); 
    // EVENT SUBMIT BUTTON MODIFY FORM POST ENDS //

    /////*AJAX METHOD*/////
    $('.update_hub').submit(function(event) {
        event.preventDefault();
        var data = {
          "Ref_client" : $('#Ref_client').val(),
          "versionHardware" : $('#versionHardware').val(),
          "versionSoftware" : $('#versionSoftware').val()
        };
        $.ajax({
          type: 'PUT',
          url: '/api/hubs/'+idHub,
          data: data
        }).done(function(result) {
          window.location.replace("/redirectUpdate");
        })
    });


});

