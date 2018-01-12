// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <http://www.gnu.org/licenses/>.

/**
 * Javascript controller for the mynotes panel at the bottom of the page.
 *
 * @module     block_mynotes/mynotesblock
 * @package    block_mynotes
 * @author     Gautam Kumar Das<gautam.arg@gmail.com>
 */
define(['jquery', 'core/yui', 'core/str', 'core/config', 'core/notification'], function($, Y, str, config, notification) {
    var CONFIG;
    var NODES = {        
        DELETE_ICON: '<span class="delete">&#x274C;</span>',
    };
    var SELECTORS = {
        MYNOTES_BASE: '#mynotes_base',
        MYNOTES_OPENER: '.mynotes-opener',
        MYNOTES_LISTS: '.mynotes_list',
    };
    var CSS = {
        MYNOTES_BASE: 'mynotes_base',
        MYNOTES_OPENER: 'mynotes-opener',
        MYNOTES_LISTS: 'mynotes_list',
    };
    var panel = null;
    var initnotes = null;
    var strdeletenote = M.util.get_string('deletemynotes', 'block_mynotes');
    
    var getMynotesValidatedUrl = function(baseurl) {
        var a = document.createElement('a');
        a.href = baseurl;
        return (a.search.length > 0) ? baseurl : baseurl + '?';
    };
    
    var mynotes = { /** @alias module:blocks/mynotes */
        
        getMynotesValidatedUrl: function(baseurl) {
            var a = document.createElement('a');
            a.href = baseurl;
            return (a.search.length > 0) ? baseurl : baseurl + '?';
        },
        /*
         * Validation for textarea input text
         */
        getWarnings: function(status) {
            if (status == false) {                
                $('#addmynote-label-' + CONFIG.instanceid + '  span.warning').html(CONFIG.maxallowedcharacters_warning);
            } else {
                var ta = $('#id_mynotecontent-' + CONFIG.instanceid);
                if (ta.val() == '') {
                    $('#addmynote-label-' + CONFIG.instanceid + '  span.warning').html('');
                } else {
                    var cl = CONFIG.maxallowedcharacters - ta.val().length;
                    $('#addmynote-label-' + CONFIG.instanceid + '  span.warning').html(M.util.get_string('charactersleft', 'block_mynotes') + cl);
                }
            }
        },
        checkInputText: function() {
            var ta = $('#id_mynotecontent-' + CONFIG.instanceid);
            if (ta.val().length <= CONFIG.maxallowedcharacters) {
                $('#addmynote_submit').removeAttr('disabled', '');
                return true;
            } else {
                $('#addmynote_submit').attr('disabled', 'disabled');
                return false;
            }
            return true;
        },
        toggle_textarea: function(e) {
            var ta = $('#id_mynotecontent-' + CONFIG.instanceid);
            
            if (!ta) {
                return false;
            }
            var focus = (e.type == 'focusin');
            if (focus) {
                if (ta.val() == M.util.get_string('placeholdercontent', 'block_mynotes')) {
                    ta.val('');
                    $('.textarea').css('border-color', 'black');
                }
            } else{
                if (ta.val() == '') {
                    ta.val(M.util.get_string('placeholdercontent', 'block_mynotes'));
                    $('.textarea').css('border-color', 'gray');
                    $('#addmynote-label-' + CONFIG.instanceid + '  span.warning').html('');
                }
            }
        },
        request: function(args) {
            var params = {};  
            var scope = this;
            if (args['scope']) {
                scope = args['scope'];
            }
            params['contextarea'] = scope.currenttab.replace(CONFIG.prefix, '');
            params['contextarea'] = params['contextarea'].replace('#', '');
            if (args.params) {
                for (i in args.params) {
                    params[i] = args.params[i];
                }
            }
            params['sesskey']   = M.cfg.sesskey;
            
            var cfg = {
                method: 'POST',
                on: {
                    start: function() {
                        //'<div class="mdl-align"><img src="'+M.util.image_url('i/loading', 'core')+'" /></div>';
                    },
                    complete: function(id,o,p) {
                        if (!o) {
                            alert('IO FATAL');
                            return false;
                        }
                        var data = Y.JSON.parse(o.responseText);
                        if (data.error) {
                            if (data.error == 'require_login') {
                                args.callback(id,data,p);
                                return true;
                            }
                            alert(data.error);
                            return false;
                        } else {
                            args.callback(id,data,p);
                            return true;
                        }
                    }
                },
                arguments: {
                    scope: scope
                },
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                },
                data: build_querystring(params)
            };
            if (args.form) {
                cfg.form = args.form;
            }
            Y.io(this.api, cfg);
        },
        saveMynotes: function(e) {
            e.preventDefault();
            var scope = this;
            
            if (scope.checkInputText() == false) {
                return false;
            }
            var ta = $('#id_mynotecontent-' + CONFIG.instanceid);
            if (ta.val() == "" || ta.val() == M.util.get_string('placeholdercontent', 'block_mynotes')) {
                return false;
            }
            var arg = {
                contextid: CONFIG.contextid,
                content: ta.val(),
                action: 'add',
                contextarea: scope.currenttabindex,
            };
            ta.attr('disabled', true);
            ta.css({
                'backgroundImage': 'url(' + M.util.image_url('i/loading_small', 'core') + ')',
                'backgroundRepeat': 'no-repeat',
                'backgroundPosition': 'center center'
            });
            this.request({
                    params: arg, 
                    callback: function(id, ret, args) {
                        if (!ret.notes) {
                            return false;
                        }
                        $('#addmynote-label-' + CONFIG.instanceid + '  span.warning').html('');
                        $('#id_mynotecontent-' + CONFIG.instanceid).val(M.util.get_string('placeholdercontent', 'block_mynotes')); 
                        $('#id_mynotecontent-' + CONFIG.instanceid).removeAttr('disabled');
                        $('#id_mynotecontent-' + CONFIG.instanceid).css({backgroundImage: ''});
                        if (scope.currenttab != scope.defaulttab) {
                            scope.currenttab = scope.defaulttab;
                            var tab = scope.currenttab.replace('#', '#tab-');
                            $(SELECTORS.MYNOTES_BASE + ' ul.tabs-menu li').removeClass("current");
                            $(SELECTORS.MYNOTES_BASE + ' ' + tab).addClass('current');
                            $(SELECTORS.MYNOTES_BASE + ' .tab-content').has(scope.currenttab).addClass('current');        
                            $(SELECTORS.MYNOTES_BASE + ' .tab-content').not(scope.currenttab).css("display", "none");
                            $(SELECTORS.MYNOTES_BASE + ' ' + scope.currenttab + '.tab-content').css("display", "block");
                        }
                        scope.addToList(ret, 'add');
                        scope.displayMynotes();
                        $(SELECTORS.MYNOTES_BASE).find('.responsetext').html(M.util.get_string('savedsuccess', 'block_mynotes'));                        
                    }
                }
            );
        },
        addToList: function(notesobj, action='') {
            var scope = this;
            var el = $(SELECTORS.MYNOTES_BASE).find(scope.currenttab + '-list');
            if (action == 'add') {
                el.prepend(scope.renderMynotes(notesobj.notes));
            } else {
                el.append(scope.renderMynotes(notesobj.notes));
                $(el).find('li').sort(sort_li) // sort elements
                  .appendTo(el); // append again to the list
                // sort function callback
                function sort_li(a, b){
                    return ($(b).data('itemid')) > ($(a).data('itemid')) ? 1 : -1;    
                }
            }
            $(SELECTORS.MYNOTES_BASE).find(scope.currenttab).attr('notes-count', notesobj.count);
        },        
        getMynotes: function(page=0) {
            var scope = this;
            page = parseInt(page);
            var el = $(SELECTORS.MYNOTES_BASE).find(scope.currenttab + '-list');
            var notescount = el.find('li').length;
            var lastpage = Math.ceil(notescount / CONFIG.perpage);
            if (notescount > 0 && lastpage > page) {
                scope.displayMynotes();
                return false;
            }           
            var arg = {           
                contextid: CONFIG.contextid,
                action: 'get',
                page: page,
            };            
            this.request({
                params: arg, 
                callback: function(id, ret, args) {
                    scope.addToList(ret);                    
                    scope.displayMynotes();
                }
            });
        }, 
        updateMynotesInfo: function(mynotescount, page) {
            page = parseInt(page);
            mynotescount = parseInt(mynotescount);
            var scope = this; 
            var paging = '';
            if (mynotescount > CONFIG.perpage) {
                var pagenum = page - 1;
                var prevlink = '';
                var nextlink = '';
                
                if (page > 0) {
                    prevlink = scope.createLink(pagenum, M.util.get_string('previouspage', 'block_mynotes'), 'previous');
                }
                if (CONFIG.perpage > 0) {
                    var lastpage = Math.ceil(mynotescount / CONFIG.perpage);
                } else {
                    var lastpage = 1;
                }
                // Uncomment this line if you want to display page number 
                //paging += '<span class="current-page">' + (page + 1) + '</span>';
                pagenum = page + 1;
                if (pagenum != lastpage) {
                    nextlink = scope.createLink(pagenum, M.util.get_string('nextpage', 'block_mynotes'), 'next');
                }
                paging = prevlink;
                if (prevlink != '' && nextlink != '') {
                    paging += '<span class="separator"></span>';
                }
                paging += nextlink;
                
                paging = '<span class="paging">' + paging + '</span>';
            }
            var noteinfo = $(SELECTORS.MYNOTES_BASE).find(scope.currenttab);
            if (mynotescount > 0) {
                noteinfo.find('.count').html(M.util.get_string('mynotescount', 'block_mynotes') + '' + mynotescount);
            } else {
                noteinfo.find('.count').html(M.util.get_string('nothingtodisplay', 'block_mynotes'));
            }
            noteinfo.find('.mynotes-paging').html(paging);
        },
        /*
         * Render notes as html ul li element
         */
        renderMynotes: function(notes) {
            if (notes.length < 1) {
                return false;
            }
            var lists = '';
            var x = '';
            for (x in notes) {
                $('#mynote-'+ CONFIG.instanceid + '-' + notes[x].id).remove();
                var deletelink = '<a href="#" id="mynote-delete-' + CONFIG.instanceid + '-' + notes[x].id + '" class="mynote-delete" title="'+ strdeletenote +'">'+ NODES.DELETE_ICON +'</a>';
                var notedetail = '';
                if (notes[x].coursename != '') {
                    notedetail = '<div class="note-detail">' + notes[x].coursename + ' - ' + '</div>';
                }
                var userdate = '<div class="time">' + notes[x].timecreated + '</div>';
                var note_html = '<div class="content">' + deletelink + notes[x].content + '</div>';
                lists += '<li id="mynote-' + CONFIG.instanceid + '-' + notes[x].id + '" data-itemid="' + notes[x].id + '">' + note_html + notedetail + userdate + '</li>';
            }
            return lists;
        },
        createLink: function(page, text, classname) {
            var classattribute = (typeof(classname) != 'undefined') ? ' class="'+classname+'"' : '';
            return '<a href="' + this.api + '&page=' + page + '"' + classattribute + '>' + text + '</a>';
        },
        displayMynotes: function() {
            var scope = this;            
            var page = parseInt($(SELECTORS.MYNOTES_BASE).find(scope.currenttab).attr('onpage'));
            var mynotescount = parseInt($(SELECTORS.MYNOTES_BASE).find(scope.currenttab).attr('notes-count'));
            var el = $(SELECTORS.MYNOTES_BASE).find(' ' + scope.currenttab + '-list');            
            var notescount = el.find('li').length;
            var lastpage = Math.ceil(notescount / CONFIG.perpage);
            
            if (notescount > 0 && lastpage <= page) {
                page = lastpage - 1;
            }
            var upperlimit = page * CONFIG.perpage + CONFIG.perpage;            
            var lowerlimit = page * CONFIG.perpage;
            el.find('li').css('display', 'none');
            el.find('li').each(function(i, el) {
                if (i>=lowerlimit && i<upperlimit) {
                    $(el).css('display', 'block');
                }
            });            
            scope.updateMynotesInfo(mynotescount, page);
            //panel.centerDialogue();
        },
        registerActions: function() {
            var scope = this; 
            
            $('body').delegate('#addmynote_cancel', 'click', function() {panel.hide()});
            $('body').delegate('#addmynote_submit', 'click', function(e) {scope.saveMynotes(e)});
            
            $('body').delegate(SELECTORS.MYNOTES_BASE + ' ul.tabs-menu li', 'click', function(e) {
                $(this).addClass("current");
                $(this).siblings().removeClass("current");
                var tab = $(this).attr("id").replace('tab-', '');
                $(SELECTORS.MYNOTES_BASE + ' .tab-content').not('#' + tab).css("display", "none");
                $(SELECTORS.MYNOTES_BASE + ' #' + tab + '.tab-content').css("display", "block");
                scope.currenttab = '#'+tab;

                var isloaded = $(scope.currenttab).attr('data-loaded');
                if (typeof isloaded == 'undefined' || isloaded == false) {
                    $(SELECTORS.MYNOTES_BASE).find(scope.currenttab).attr('data-loaded', "true");
                    scope.getMynotes(0);
                }                    
            });
            
            $('body').delegate('#id_mynotecontent-' + CONFIG.instanceid, 'focus blur', function(e) {
                scope.toggle_textarea(e);
            });
            $('body').delegate('#id_mynotecontent-' + CONFIG.instanceid, 'change keypress keyup', function(e) {
                scope.getWarnings(scope.checkInputText());         
            });
            
            $('body').delegate(SELECTORS.MYNOTES_BASE + ' .mynotes-paging .paging a', 'click', function(e) {
                e.preventDefault();
                var regex = new RegExp(/[\?&]page=(\d+)/);
                var results = regex.exec($(this).attr('href'));
                var page = 0;
                if (results[1]) {
                    page = results[1];
                }
                $(SELECTORS.MYNOTES_BASE).find(scope.currenttab).attr('onpage', parseInt(page));
                scope.getMynotes(page);
            });
            $('body').delegate(SELECTORS.MYNOTES_BASE + ' a.mynote-delete', 'click', function(e) {
                e.preventDefault();                
                var nid = $(this).attr('id');
                if (nid != '' || nid != 'undefined') {
                    var notescount = $(SELECTORS.MYNOTES_BASE).find(SELECTORS.MYNOTES_LISTS + '-' + scope.currenttab + ' > li').length;
                    var id = nid.replace('mynote-delete-'+ CONFIG.instanceid + '-', '');                    
                    var arg = {
                        contextid: CONFIG.contextid,
                        action: 'delete',
                        noteid: id,
                        lastnotecounts: notescount,
                    };
                    scope.request({
                        params: arg, 
                        callback: function(id, ret, args) { 
                            args.scope.addToList(ret);
                            $('#mynote-'+ CONFIG.instanceid + '-' + ret.noteid).remove();                            
                            args.scope.displayMynotes();
                        }
                    });
                }                
            });
        },
        displayDialogue: function(e) {
            var scope = mynotes;
            if (panel === null) {
                str.get_strings([
                    {key : 'mynotes', component : 'block_mynotes'},
                    {key : 'characterlimit', component : 'block_mynotes'},
                    {key : 'save', component : 'block_mynotes'},                
                    {key : 'cancel'},
                    {key : 'mynotessavedundertab', component : 'block_mynotes', param: CONFIG.contextareas[scope.currenttabindex]},
                    {key : 'placeholdercontent', component : 'block_mynotes'}
                ]).done(function(s) {
                    // Create basic tab structure
                    var el = $('<div></div>').append($('<div id="' + CSS.MYNOTES_BASE + '" class="' + CSS.MYNOTES_BASE + '"></div>')
                        .append('<div class="inputarea"><div class="responsetext"></div><div id="addmynote-label-' + CONFIG.instanceid + '">' + s[1] + ' ' + CONFIG.maxallowedcharacters + '<span class="warning"></span></div>' +
                            '<div class="textarea"><textarea id="id_mynotecontent-' + CONFIG.instanceid + '" name="mynotecontent" rows="2">' + s[5] + '</textarea></div>' +
                            '<p class="notesavedhint">' + s[4] + '</p>' +
                            '<p class="mdl-align"><input type="submit" id="addmynote_submit"/></p>' +
                            '</div>'
                            )
                            .append($('<ul class="tabs-menu"></ul>'))
                            .append($('<div class="tab"></div>'))
                        );
                    el.find('#addmynote_submit').attr('value', s[2]);
                    el.find('#addmynote_cancel').attr('value', s[3]); 
                    var tabsmenu = '';
                    var tabcontents = '';
                    var i = '';
                    for (i in CONFIG.contextareas) {
                        if (scope.currenttabindex == i) {
                            tabsmenu += '<li class="current" id="tab-' + CONFIG.prefix + i + '"><div class="menu-item">' + CONFIG.contextareas[i] + '</div></li>';
                        } else {
                            tabsmenu += '<li class="" id="tab-' + CONFIG.prefix + i + '"><div class="menu-item">' + CONFIG.contextareas[i] + '</div></li>';
                        }
                        tabcontents += '<div class="tab-content" id="' + CONFIG.prefix + i + '" onpage="0" notes-count="0">'
                            + '<div class="notes-info"><div class="mynotes-paging"></div><div class="count"></div></div>'
                            + '<ul id="' + CONFIG.prefix + i + '-list" class="mynotes_lists"></ul>'
                            + '</div>';
                    }
                    el.find('.tabs-menu').append(tabsmenu);
                    el.find('.tab').append($(tabcontents));
                    Y.use('moodle-core-notification-dialogue', function() {
                        panel = new M.core.dialogue({
                            draggable: true,
                            modal: true,
                            closeButton: true,
                            headerContent: M.util.get_string('mynotes', 'block_mynotes'),
                            responsive: true,
                        });
                        panel.set('bodyContent', el.html());
                        if (initnotes === null) {
                            initnotes = true;                        
                            // Get initial notes
                            scope.getMynotes(0);
                            $(SELECTORS.MYNOTES_BASE).find(scope.currenttab).attr('data-loaded', "true");
                            $(SELECTORS.MYNOTES_BASE).find(scope.currenttab).css('display', 'block');
                        }
                        panel.show();
                    });
                    scope.registerActions();
                    
                });
            } else {
                panel.show();
            }            
        },
        /**
         * Initialize mynotes
         * @access public
         * @param {int} instanceid
         * @param {int} contextid
         * @param {int} maxallowedcharacters
         * @param {int} perpage   
         * @param {string} editingicon_pos        
         * @param {bool} editing
         * @param {string} adminurl
         * @param {array} contextareas
         * @param {string} currenttabindex      
         */
        init: function(args) {
            CONFIG = args;    
            CONFIG.prefix = 'mynotes_';
            this.perpage = parseInt(CONFIG.perpage);    
            this.currenttab = '#mynotes_' + args.currenttabindex;
            this.defaulttab = '#mynotes_' + args.currenttabindex;    
            this.currenttabindex = args.currenttabindex;
            this.api = this.getMynotesValidatedUrl(M.cfg.wwwroot+'/blocks/mynotes/mynotes_ajax.php');
            
            var strtitle =  M.util.get_string('showmynotes', 'block_mynotes');
            if (!CONFIG.editing) {
                var handler = $('<div class="'+ CSS.MYNOTES_OPENER +'" title="' + strtitle + '" alt="' + strtitle+ '">' + M.util.get_string('mynotes', 'block_mynotes') + '</div>');
                handler.addClass(CONFIG.editingicon_pos);
                $('body').append(handler);
                handler.html('<span class="pencil">&#x270D;</span>');
            } else {
                var handler = $('<div class="'+ CSS.MYNOTES_OPENER +'" title="' + strtitle + '" alt="' + strtitle+ '">' + M.util.get_string('mynotes', 'block_mynotes') + '</div>');
                handler.addClass(CONFIG.editingicon_pos);
                handler.html('<span class="pencil">&#x270D;</span>');                
                $('.inline-'+ CSS.MYNOTES_OPENER).html(handler);
                $('.inline-'+ CSS.MYNOTES_OPENER).append('<div class="mynotes-pos-inline-text '+ CSS.MYNOTES_OPENER +'">' + strtitle + '</div>');
            }
            var body = $('body');
            body.delegate(SELECTORS.MYNOTES_OPENER, 'click', this.displayDialogue);
        }
    };
    return mynotes;
});