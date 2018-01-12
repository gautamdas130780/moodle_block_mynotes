YUI.add('moodle-block_mynotes-mynotes', function(Y) {

    var MNTS = {
        NAME: 'block_mynotes',
        BASE: 'base',
        EDITINGICONPOS: 'editingicon_pos',
        CONTEXTAREAS: 'contextareas',
        PERPAGE: 'perpage',
        PAGE: 'page',
        MAXINPUTCHARACTER: 'maxallowedcharacters',
        CURRENTTAB: 'currenttabindex',
        EDITING: 'editing',
        CONTEXTID: 'contextid',
        INSTANCEID: 'instanceid',
        PREFIX: 'mynotes_',
        API: 'ajaxurl',
    };
    var STR = {
        DELETNOTETITLE: M.util.get_string('deletemynotes', 'block_mynotes'),
    };
    var CSS = {    
        BASE: 'base',
        MYNOTESBASE: 'mynotes_base',
        OPENERWAPPER: 'mynotes-opener',
        OPENER: 'opener',
        LISTS: 'list',  
        DELETE_ICON: '<span class="delete">&#x274C;</span>',
        MYNOTE: 'mynote',
    };
    
    var create = Y.Node.create;

    var MYNOTES = function(config) {
        MYNOTES.superclass.constructor.apply(this, arguments);
    };

    Y.extend(MYNOTES, Y.Base, {

        event:null,
        panelevent: null,
        panel: null, //all the comment boxes

        initializer : function(config) {
            var strtitle =  M.util.get_string('showmynotes', 'block_mynotes');
            
            this.set(CSS.BASE, create('<div class="'+CSS.OPENERWAPPER+'"></div>')
                    .append(create('<div class="'+ CSS.OPENER +'" title="' + strtitle + '" alt="' + strtitle+ '">' + '<span class="pencil">&#x270D;</span>' + '</div>')
                    )
                );
            this.get(CSS.BASE).one('.'+CSS.OPENER).addClass(this.get(MNTS.EDITINGICONPOS));
            if (!this.get(MNTS.EDITING)) {
                Y.one(document.body).append(this.get(CSS.BASE));
            } else {
                Y.one('.inline-'+ CSS.OPENERWAPPER).setContent(this.get(CSS.BASE).getContent() + '<div class="mynotes-pos-inline-text">' + strtitle + '</div>');
            }
            
            Y.one('.'+CSS.OPENER).on('click', this.show, this);
            
            var tabsmenu = '';
            var tabcontents = '';
            var i = '';
            for (i in this.get(MNTS.CONTEXTAREAS)) {                
                if (this.get(MNTS.CURRENTTAB) == i) {
                    tabsmenu += '<li class="current" id="tab-' + MNTS.PREFIX + i + '"><div class="menu-item">' + this.get(MNTS.CONTEXTAREAS)[i] + '</div></li>';
                } else {
                    tabsmenu += '<li class="" id="tab-' + MNTS.PREFIX + i + '"><div class="menu-item">' + this.get(MNTS.CONTEXTAREAS)[i] + '</div></li>';
                }
                tabcontents += '<div class="tab-content" id="' + MNTS.PREFIX + i + '" data-onpage="0">'
                    + '<div class="notes-info"><div class="mynotes-paging"></div><div class="count"></div></div>'
                    + '<ul id="' + MNTS.PREFIX + i + '-list" class="' +MNTS.PREFIX+ 'lists"></ul>'
                    + '</div>';
            }
            this.set(MNTS.BASE, create('<div></div>')
                    .append(create('<div class="' + CSS.MYNOTESBASE + '"></div>')
                    .append(create('<div class="inputarea"></div>')
                        .append(create('<div class="responsetext"></div>'))
                        .append(create('<div id="addmynote-label-' + this.get(MNTS.INSTANCEID) + '">' + M.util.get_string('characterlimit', 'block_mynotes') + ' ' + this.get(MNTS.MAXINPUTCHARACTER) + '<span class="warning"></span></div>'))
                        .append(create('<div class="textarea"></div>')
                            .append(create('<textarea id="id_mynotecontent-' + this.get(MNTS.INSTANCEID) + '" name="mynotecontent" rows="2">' + M.util.get_string('placeholdercontent', 'block_mynotes') + '</textarea>')))
                        .append(create('<p class="notesavedhint">' + M.util.get_string('mynotessavedundertab', 'block_mynotes', this.get(MNTS.CONTEXTAREAS)[this.get(MNTS.CURRENTTAB)]) + '</p>'))
                        .append(create('<p class="mdl-align"><input type="submit" id="addmynote_submit"/></p>'))
                        )
                    .append(create('<ul class="tabs-menu">' + tabsmenu + '</ul>'))
                    .append(create('<div class="tabs">' + tabcontents + '</div>'))
                    )
                );  
            this.get(MNTS.BASE).plug(Y.Plugin.Drag);
            this.panel = new M.core.dialogue({
                    headerContent: M.util.get_string('mynotes', 'block_mynotes'),
                    bodyContent: this.get(MNTS.BASE).getContent(),
                    visible: false, //by default it is not displayed
                    modal: false,
                    zIndex:100,
                    closeButtonTitle: this.get('closeButtonTitle'),
                    draggable: true,
                });                
            this.registerActions();  
        },
        getWarnings : function(e) {
            var status = this.checkInputText(e);
            if (status == false) {                
                Y.one('#addmynote-label-' + this.get(MNTS.INSTANCEID) + '  span.warning').setContent(M.util.get_string('maxallowedcharacters_warning', 'block_mynotes'));
            } else {
                var ta = e.currentTarget;
                if (ta.get('value') == '') {
                    Y.one('#addmynote-label-' + this.get(MNTS.INSTANCEID) + '  span.warning').setContent('');
                } else {
                    var cl = this.get(MNTS.MAXINPUTCHARACTER) - ta.get('value').length;
                    Y.one('#addmynote-label-' + this.get(MNTS.INSTANCEID) + '  span.warning').setContent(M.util.get_string('charactersleft', 'block_mynotes') + cl);
                }
            }
        },
        checkInputText : function(e) {            
            var ta = e.target; 
            if (ta.get('value').length <= this.get(MNTS.MAXINPUTCHARACTER)) {
                Y.one('#addmynote_submit').removeAttribute('disabled', '');
                return true;
            } else {
                Y.one('#addmynote_submit').setAttribute('disabled', 'disabled');
                return false;
            }
            return true;
        },
        toggle_textarea : function(e) {
            var ta = e.currentTarget;            
            if (!ta) {
                return false;
            }
            if (e.type == 'focus') {
                if (ta.get('value') == M.util.get_string('placeholdercontent', 'block_mynotes')) {
                    ta.set('value', '');
                    ta.ancestor('.textarea').setStyle('border-color', 'black');
                }
            } else{
                if (ta.get('value') == '') {
                    ta.set('value', M.util.get_string('placeholdercontent', 'block_mynotes'));
                    ta.ancestor('.textarea').setStyle('border-color', 'gray');
                    Y.one('#addmynote-label-' + this.get(MNTS.INSTANCEID) + '  span.warning').setContent('');
                }
            }
        },
        loadInitData : function(el) {
            Y.all('.' + CSS.MYNOTESBASE + ' ul.tabs-menu li').removeClass('current');
            el.addClass('current');
            Y.all('.' + CSS.MYNOTESBASE + ' .tab-content').setStyle('display', 'none');            
            var tab = el.get("id").replace('tab-', '');
            Y.one('#' + tab + '.tab-content').setStyle('display', 'block');  
            if (Y.one('#' + tab + '.tab-content').getAttribute('data-loaded') != 'true') {
                Y.one('#' + tab + '.tab-content').setAttribute('data-loaded', 'true');
                this.getMynotes(0);
            }            
        },
        loadData : function(e) {
            Y.all('.' + CSS.MYNOTESBASE + ' ul.tabs-menu li').removeClass('current');
            e.currentTarget.addClass('current');
            Y.all('.' + CSS.MYNOTESBASE + ' .tab-content').setStyle('display', 'none');            
            var tab = e.currentTarget.get("id").replace('tab-', '');
            Y.one('#' + tab + '.tab-content').setStyle('display', 'block');  
            if (Y.one('#' + tab + '.tab-content').getAttribute('data-loaded') != 'true') {
                Y.one('#' + tab + '.tab-content').setAttribute('data-loaded', 'true');
                this.getMynotes(0);
            }            
        }, 
        makeActiveTab : function(tab) {
            Y.all('.' + CSS.MYNOTESBASE + ' ul.tabs-menu li').removeClass('current');
            Y.all('.' + CSS.MYNOTESBASE + ' .tab-content').setStyle('display', 'none');     
            Y.one('#tab-' + MNTS.PREFIX + tab).addClass('current');
            Y.one('#' + MNTS.PREFIX + tab + '.tab-content').setStyle('display', 'block');  
        },
        getActivetab : function() {
            return Y.one('.' + CSS.MYNOTESBASE + ' ul.tabs-menu li.current').get('id').replace('tab-' + MNTS.PREFIX, '');
        },
        renderMynotes : function(notes) {
            if (notes.length < 1) {
                return false;
            }
            var lists = '';
            var x = '';
            for (x in notes) {
                var nodeid = MNTS.PREFIX + this.get(MNTS.INSTANCEID) + '_' + notes[x].id;
                if (Y.all('#' + nodeid).length > 0) {
                    Y.all('#' + nodeid).remove();
                }
                var deletelink = '<a href="#" class="mynote-delete" title="'+ STR.DELETNOTETITLE +'">'+ CSS.DELETE_ICON +'</a>';
                var notedetail = '';
                if (notes[x].coursename != '') {
                    notedetail = '<div class="note-detail">' + notes[x].coursename + ' - ' + '</div>';
                }
                var userdate = '<div class="time">' + notes[x].timecreated + '</div>';
                var note_html = '<div class="content">' + deletelink + notes[x].content + '</div>';
                lists += '<li id="' + nodeid + '" class="' + CSS.MYNOTE + '" data-itemid="' + notes[x].id + '">' + note_html + notedetail + userdate + '</li>';
            }
            return lists;
        },
        createLink: function(page, text, classname) {
            var classattribute = (typeof(classname) != 'undefined') ? ' class="'+classname+'"' : '';
            return '<a href="' + this.api + '&page=' + page + '"' + classattribute + '>' + text + '</a>';
        },
        updateMynotesInfo : function(tab) {
            var el = Y.one('#' + MNTS.PREFIX + tab); 
            var page = parseInt(el.getData('onpage'));
            var notescount = parseInt(el.getData('notescount'));
            var perpage = parseInt(this.get(MNTS.PERPAGE));
            var lastpage = Math.ceil(notescount / perpage);
            
            if (notescount > 0 && lastpage <= page) {
                page = lastpage - 1;
            }
            var upperlimit = parseInt(page * perpage) + perpage;            
            var lowerlimit = page * perpage;
            
            el.all('.mynotes_lists > li').setStyle('display', 'none');
            el.all('.mynotes_lists > li').each(function(el, i) {
                if (i>=lowerlimit && i<upperlimit) {
                    (el).setStyle('display', 'block');
                }
            });
            var paging = '';
            if (notescount > perpage) {
                var pagenum = page - 1;
                var prevlink = '';
                var nextlink = '';
                
                if (page > 0) {
                    prevlink = this.createLink(pagenum, M.util.get_string('previouspage', 'block_mynotes'), 'previous');
                }
                if (perpage > 0) {
                    var lastpage = Math.ceil(notescount / perpage);
                } else {
                    var lastpage = 1;
                }
                // Uncomment this line if you want to display page number 
                //paging += '<span class="current-page">' + (page + 1) + '</span>';
                pagenum = page + 1;
                if (pagenum != lastpage) {
                    nextlink = this.createLink(pagenum, M.util.get_string('nextpage', 'block_mynotes'), 'next');
                }
                paging = prevlink;
                if (prevlink != '' && nextlink != '') {
                    paging += '<span class="separator"></span>';
                }
                paging += nextlink;
                
                paging = '<span class="paging">' + paging + '</span>';
            }
            var noteinfo = el.one('.notes-info');
            if (notescount > 0) {
                noteinfo.one('.count').setContent(M.util.get_string('mynotescount', 'block_mynotes') + '' + notescount);
            } else {
                noteinfo.one('.count').setContent(M.util.get_string('nothingtodisplay', 'block_mynotes'));
            }
            noteinfo.one('.mynotes-paging').setContent(paging);
        },
        sort : function(el) {
            var ar = new Array();
            el.get('children').each(function(e) { ar.push(e); }); 
            ar.sort(function(a, b) { return (b.getData('itemid')) > (a.getData('itemid')) ? 1 : -1;});            
            for (var i=0; i<ar.length; i++) {
                el.append(ar[i]);
            }
            return el;
        },
        addToList : function(notesobj, action='') {
            var tab = notesobj.contextarea;
            var el =  Y.one('#' + MNTS.PREFIX + tab + '-list');
            
            if (action == 'add') {
                el.prepend(this.renderMynotes(notesobj.notes));
                Y.one('#' + MNTS.PREFIX + tab).setData('notescount', notesobj.count);
                this.updateMynotesInfo(tab);
            } else {
                Y.one('#' + MNTS.PREFIX + tab).setData('notescount', notesobj.count);
                el.append(this.renderMynotes(notesobj.notes)); 
                //this.sort(el);
                this.updateMynotesInfo(tab);
            }
        },
        getMynotes : function(page) {
            var atab = this.getActivetab();            
            page = parseInt(page);
            var ulli = Y.one('#' + MNTS.PREFIX + atab + '-list').get('children');
            var notescount = ulli.get('node').length;            
            var lastpage = Math.ceil(notescount / this.get(MNTS.PERPAGE));
            if (notescount > 0 && lastpage > page) {
                this.updateMynotesInfo(atab);
                return false;
            }           
            var arg = {           
                contextid: this.get(MNTS.CONTEXTID),
                action: 'get',
                page: page,
            };            
            this.request({
                params: arg, 
                callback: function(id, ret, args) {
                    args.scope.addToList(ret);                    
                }
            });
        },        
        saveMynotes : function(e) {
            e.preventDefault();
            var scope = this;
            var ta = Y.one('#id_mynotecontent-' + this.get(MNTS.INSTANCEID));
            var arg = {
                contextid: this.get(MNTS.CONTEXTID),
                contextarea: this.get(MNTS.CURRENTTAB),
                content: ta.get('value'),
                action: 'add',
            };
            ta.setAttribute('disabled', true);
            ta.setStyle({
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
                        var instanceid = scope.get(MNTS.INSTANCEID);
                        Y.one('#addmynote-label-' + instanceid + '  span.warning').setContent('');
                        Y.one('#id_mynotecontent-' + instanceid).set('value', M.util.get_string('placeholdercontent', 'block_mynotes')); 
                        Y.one('#id_mynotecontent-' + instanceid).removeAttribute('disabled');
                        Y.one('#id_mynotecontent-' + instanceid).setStyle({backgroundImage: ''});
                        args.scope.makeActiveTab(ret.contextarea);                        
                        args.scope.addToList(ret, 'add');                        
                        args.scope.get(MNTS.BASE).one('.'+CSS.MYNOTESBASE).one('.responsetext').setContent(M.util.get_string('savedsuccess', 'block_mynotes'));                        
                    }
                }
            );
        },
        loadPage : function(e) {
            e.preventDefault();
            var regex = new RegExp(/[\?&]page=(\d+)/);
            var results = regex.exec(e.currentTarget.get('href'));
            var page = 0;
            if (results[1]) {
                page = results[1];
            }
            e.target.ancestor('.tab-content').setData('onpage', page);
            this.getMynotes(page);
        },
        delete : function(e) {
            e.preventDefault();
            var node = e.target; 
            if (!node.test('a')) {
                node = node.ancestor('a.mynote-delete');
            }
            var row = node.ancestor('li.' + CSS.MYNOTE);
            var noteid = row.getData('itemid');
            if (noteid) {
                var notescount = row.ancestor('ul.mynotes_lists').all('li.' + CSS.MYNOTE).get('node').length;
                var arg = {
                    contextid: this.get(MNTS.CONTEXTID),
                    action: 'delete',
                    noteid: noteid,
                    lastnotecounts: notescount,
                };
                this.request({
                    params: arg, 
                    callback: function(id, ret, args) {
                        row.remove(); 
                        args.scope.addToList(ret);                        
                    }
                });
            }
        },
        request: function(args) {
            var params = {};  
            var scope = this;
            if (args['scope']) {
                scope = args['scope'];
            }
            params['contextarea'] = this.getActivetab().replace(MNTS.PREFIX, '');
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
            Y.io(this.get(MNTS.API), cfg);
        },
        registerActions : function() {            
            Y.all('.' + CSS.MYNOTESBASE + ' ul.tabs-menu li').on('click', this.loadData, this);
            Y.one('#addmynote_submit').on('click', this.saveMynotes, this);            
            Y.one('#id_mynotecontent-' + this.get(MNTS.INSTANCEID)).on(['focus', 'blur'], this.toggle_textarea, this);
            Y.one('#id_mynotecontent-' + this.get(MNTS.INSTANCEID)).on(['change', 'keypress', 'keyup'], this.getWarnings, this);
            Y.delegate('click', this.delete, 'body', 'a.mynote-delete', this);
            Y.delegate('click', this.loadPage, 'body', '.mynotes-paging .paging a', this);
        },
        show : function (e) {
            this.loadInitData(Y.one('#tab-' + MNTS.PREFIX + this.get(MNTS.CURRENTTAB)));
            this.panel.show(); //show the panel
        },

        hide : function (e) {
            this.panel.hide(); //hide the panel
        }

    }, {
        NAME : MNTS.NAME,
        ATTRS : {
            instanceid: {
                value : 0
            },
            editing : {
                value : false,
                validator : Y.Lang.isBool
            },
            editingicon_pos: {
                value : 'mynotes-pos-rt'
            },
            maxallowedcharacters: {
                value : 180,
            },
            contextid: {
                value : 0,
            },
            maxallowedcharacters_warning: {
                value: ''
            },
            contextareas: {
                validator : Y.Lang.isObject,
                value : []
            },
            currenttabindex: {
                value: 'site'
            },
            perpage: {
                value: 5,
                Validator: Y.Lang.isNumber
            },
            closeButtonTitle : {
                validator : Y.Lang.isString,
                value : 'Close'
            },
            ajaxurl : {
                validator : Y.Lang.isString
            },
            base : {
                setter : function(node) {
                    var n = Y.one(node);
                    if (!n) {
                        Y.fail(MNTS.NAME +': invalid base node set');
                    }
                    return n;
                }
            },
        }
    });
    Y.augment(MYNOTES, Y.EventTarget);
    M.blocks_mynotes = M.blocks_mynotes || {};
    M.blocks_mynotes.init_mynotes = function(params) {
        return new MYNOTES(params);
    }

}, '@VERSION@', {
    requires:['base', 'moodle-core-notification']
});
