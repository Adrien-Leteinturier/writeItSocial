exports.fonctionCouperTextePourApercu = function(text,firstCutValue,endCutValue){
    var texteCouper = text.slice(firstCutValue,endCutValue);
    var textFinalCouper = texteCouper.slice(firstCutValue,texteCouper.lastIndexOf(' ')) + '…';
    return textFinalCouper;
};
