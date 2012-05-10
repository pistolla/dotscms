/* Setup Namespaces */
createNamespace("Dots.Blocks.Links.Handlers");
createNamespace("Dots.Blocks.Links.Helpers");

Dots.Blocks.Links.init = function(){
    $('.dots-blocks>.dots-block .dots-links-block [data-action="add_link"]').live('click', Dots.Blocks.Links.Handlers.add);
    $('.dots-blocks>.dots-block .dots-links-block [data-action="edit_link"]').live('click', Dots.Blocks.Links.Handlers.edit);
    $('.dots-blocks>.dots-block .dots-links-block [data-action="remove_link"]').live('click', Dots.Blocks.Links.Handlers.remove);
    $('.dots-blocks>.dots-block .dots-links-block [data-action="cancel-link-block"]').live('click', Dots.Blocks.Links.Handlers.cancel);
    $('.dots-blocks>.dots-block .dots-links-block [data-action="save-link-block"]').live('click', Dots.Blocks.Links.Handlers.save);
    Dots.Blocks.Links.Helpers.setupFormActions();
};

/**
 * Handlers
 */
Dots.Blocks.Links.Handlers.add = function (){
    var $this = $(this);
    var block_id = $this.parents('.dots-block').attr('data-block');
    var data = {

    };
    $.get('/dots/link-block/add/', data, function (html){
        var $form = $('<li class="link-form static">'+html+'</li>');
        $form.insertBefore($this.parent('li'));
        $form.find('[name$="[type]"]').trigger('change');
        $this.parent('li').hide();
        Dots.Blocks.Links.Helpers.enableEditors($form);
    });
    return false;
};

Dots.Blocks.Links.Handlers.edit = function (){
    var $this = $(this);
    var block_id = $this.parents('.dots-block').attr('data-block');
    var link_id = $this.parents('li').first().attr('data-block-link-id');
    var data = {
        block_id: block_id,
        id: link_id
    };
    $.get('/dots/link-block/edit/', data, function (html){
        var $form = $('<li class="link-form static">' + html + '</li>');
        $form.insertBefore($this.parents('li').first());
        $form.find('[name$="[type]"]').trigger('change');
        $this.parents('li').first().hide();
        Dots.Blocks.Links.Helpers.enableEditors($form);
    });
    return false;
};

Dots.Blocks.Links.Handlers.remove = function (){
    var $this = $(this);
    var link_id = $this.parents('li').first().attr('data-block-link-id');
    var data = {
        id: link_id
    };
    $.get('/dots/link-block/remove/', data, function (response) {
        console.log(response);
        $this.parents('li').first().remove();
    });
    return false;
};

Dots.Blocks.Links.Handlers.save = function (){
    var $form = $(this).parents('form');
    var $li = $form.parent('li');
    var $block = $li.parents('.dots-block');
    var pos = $li.prevAll('li').length + 1;
    var blockPos = $block.prevAll('.dots-block').length + 1;
    var section = $block.parents('.dots-blocks').attr('data-section');
    var data = {
        position: blockPos,
        block_id: $block.attr('data-block'),
        section: section,
        alias: Dots.Pages.Admin.getPageAlias()
    };
    var id = $form.find('[name$="[id]"]').val();
    $form.find('[name$="[position]"]').val(pos);
    $form.ajaxSubmit({
        dataType: 'json',
        data: data,
        type: 'POST',
        url: 'dots/link-block/save/',
        success: function (response, status, xhr, form) {
            if (!response.success) {
                Dots.Admin.renderErrors(form, response.errors, null);
            } else {
                var data = response.data;
                var $item = $('<li data-block-link-id="' + data.id + '"></li>');
                $block.attr('data-block', data.block_id);
                $item.insertBefore($li);
                $item.html( '<div class="link-edit"> ' +
                                '<a data-action="move_link" href="#move-link"><i class="icon-move"></i></a> ' +
                                '<a data-action="edit_link" href="#edit-link"><i class="icon-pencil"></i></a> ' +
                                '<a data-action="remove_link" href="#remove-link"><i class="icon-remove"></i></a> ' +
                            '</div> ' +
                            '<a href="'+ data.href +'">' + data.title + '</a> ');
                if (id){
                    $li.next().remove();
                }else{
                    $li.next().show();  //show the add link anchor
                }

                $li.remove();       //remove the form
//                Dots.Blocks.Links.Handlers.cancel.call(form);
            }
        }
    });
    return false;
};

Dots.Blocks.Links.Handlers.cancel = function (){
    var $li = $(this).parents('li.link-form');
    $li.next('li').show();
    $li.remove();
    return false;
};

/**
 * Helpers
 */
Dots.Blocks.Links.Helpers.setupFormActions = function(){
    $('.dots-blocks>.dots-block .dots-links-block .link-form [name$="[type]"]').live('change', function(event){
        var value = $(this).val();
        $(this).children().each(function(){
            if ($(this).val()!=value){
                $('.dots-blocks>.dots-block .dots-links-block .link-form [id$="' + $(this).val() + '-label"]').hide().next().hide().find(':input').val('');
            }
        });
        $('.dots-blocks>.dots-block .dots-links-block .link-form [id$="'+value+'-label"]').show().next().show();
    });
    Dots.Event.attach('block.initEditors', Dots.Blocks.Links.Helpers.setupMoveHandler);
};

Dots.Blocks.Links.Helpers.setupMoveHandler = function(){
    var $block = this;
    $block.find(".dots-links-block").sortable({
        handle:'[data-action="move_link"]',
        helper:function (event, item) {
            $(item).addClass('dots-move-link-helper');
            return item;
        },
        stop:function (event, ui) {
            var $target = $(event.target);
            var $item = $(ui.item);
            $item.removeClass('dots-move-link-helper');
            $block = $item.parents('.dots-block');
            var position = $item.prevAll('li').length + 1;
            var data = {
                block_id:$block.attr('data-block'),
                id: $item.attr('data-block-link-id'),
                alias:Dots.Pages.Admin.getPageAlias(),
                position:position
            };
            $.getJSON('/dots/link-block/move/', data, function (resp) {

            });
        },
        axis:'y',
        cursorAt:{ left:-60, top:20 },
        items:"li:not(.static)"
    }).disableSelection();
};

Dots.Blocks.Links.Helpers.enableEditors = function($linkForm){
    $linkForm.find('[name$="[page]"]').autocomplete({
        source:'dots/link-block/get-pages/',
        minLength:2,
        select:function (event, ui) {
            $(this).parents('.link-form').find('[name$="[entity_id]"]').val(ui.item.id);
        }
    }).data('autocomplete')._renderMenu = function(ui, items){
        if (!ui.hasClass('dropdown-menu'))
            ui.addClass('dropdown-menu');

        for (var key in items){
            this._renderItem(ui, items[key]);
        }
    };
};