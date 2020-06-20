$Terminal = function(){
    let offset = 0;
    let word = '';
    let coordinates = {
        top : 0,
        left : 0
    };
};
$('document').ready(function(){
    $('#terminal-input')
        .focus()
        .setCursorPosition($('#terminal-input').val().length)
    ;

    $('#terminal-search').autocomplete({
        autoFocus: true,
	    minLength: 3,
        source: function (request, response) {
            jQuery.get("/terminal/search", {term: request.term}, function (data) {response(data);});
        },
        delay : 500,
        select : function (event, ui) {
            let $terminalInput = $('#terminal-input');
            let $content1 = $terminalInput.val().substring(0, ($Terminal.offset - $Terminal.word.length));
            let $content2 = $terminalInput.val().substring($Terminal.offset);
            $terminalInput.val($content1 + ui.item.value + '()' + $content2);
            $terminalInput.focus().setCursorPosition($Terminal.offset + (
                ui.item.value.length - $Terminal.word.length + 1
            ));
            $.get("/terminal/doc", {term : ui.item.value}, function(data) {
                $('#function-doc').html(data.replace("\n", '<br>'));
            });
        }
    });
    $(document).keyup(function(event) {
        if (event.keyCode == 27) {
            return $('#terminal-search').autocomplete('close');
        }
    });
    $('#terminal-input').keyup(function(event){
        if (event.keyCode == 40 && $('.ui-autocomplete li').length) {
            $('.ui-autocomplete li').eq(0).focus();
            return false;
        }
        $Terminal.offset = getCaretCharacterOffsetWithin(this);
        let $content = $(this).val().substring(0, $Terminal.offset).split(/[^\w\.\_]/);
        $Terminal.word = $content.pop();
        $Terminal.coordinates = getCaretCoordinates(this, this.selectionEnd);
        $('#terminal-search').css({
            top : $Terminal.coordinates.top + 20,
            left: $Terminal.coordinates.left - $Terminal.word.length * 10
        });
        $('#terminal-search').val($Terminal.word).autocomplete('search', $Terminal.word);
    });
});
$.fn.setCursorPosition = function(pos) {
    this.each(function(index, elem) {
        if (elem.setSelectionRange) {
            elem.setSelectionRange(pos, pos);
        } else if (elem.createTextRange) {
            var range = elem.createTextRange();
            range.collapse(true);
            range.moveEnd('character', pos);
            range.moveStart('character', pos);
            range.select();
        }
    });
    return this;
};
function getCaretCharacterOffsetWithin(el) {
    if (el.selectionStart) {
        return el.selectionStart;
    } else if (document.selection) {
        el.focus();
        var r = document.selection.createRange();
        if (r == null) {
            return 0;
        }
        var re = el.createTextRange(),
            rc = re.duplicate();
        re.moveToBookmark(r.getBookmark());
        rc.setEndPoint('EndToStart', re);
        return rc.text.length;
    }
    return 0;
}
