$.fn.autocomplete = function(params) {
    var autocomplete = this;

    var defaults = {
        appendTo: null,
        minLength: 1,
        delay: 300,
        autoFocus: true,
        auto: true,
        cache: true,
        itemClass: 'li.ui-menu-item',
        position: {
            my: "left top",
            at: "left bottom",
            collision: "none"
        },
        template: 
            '{{each data as value}}' +
            '<li class="ui-menu-item">{{value}}</li>' +
            '{{/each}}',
        source: null,
        select: null,
        close: null
    }
    $.extend(defaults, params);
    
    // 组件初始化
    autocomplete.init = function() {
        var _this = this;

        // 可配置项
        this.options = defaults;

        // element, menu
        this.element = $(this)
            .addClass("ui-autocomplete-input")
            .attr("autocomplete", "off");
        this.menu = $('<ul>')
            .addClass('ui-autocomplete')
            .appendTo(this.options.appendTo || this.element.parent())
            .hide();


        // 元素类型取值方法
        var nodeName = this.element.get(0).nodeName.toLowerCase(),
            isTextarea = nodeName === "textarea",
            isInput = nodeName === "input";
        this.valueMethod = this.element[isTextarea || isInput ? "val" : "text"];

        // 缓存
        this.cache = {};
        this.cacheKey = null;

        // 绑定事件
        this.element.on({
            keydown: function(event) {
                switch (event.keyCode) {                
                    case 38://UP
                        _this.move("prev", event);
                        break;
                    case 40://DOWN
                        _this.move("next", event);
                        break;
                    case 13://ENTER
                        // 菜单已经打开，且获得焦点
                        if (_this.active) {
                            event.preventDefault();
                            _this.select(event);
                        }
                        break;
                    //case 7://TAB
                    case 27://ESCAPE
                        if (_this.active) {
                            _this.close(event);

                            // Esc 对于不同的浏览器有不同的行为
                            // 单按，一般来说的重做或取消
                            // 双按，在IE中是清空整个Form
                            event.preventDefault();
                        }
                        break;
                    default:
                        // Input输入值改变后，触发搜索事件
                        if(_this.options.auto)
                            _this.searchTimeout(event);
                        break;
                }
            },
            focus: function(event) {
                _this.close(event);
            },
            blur: function(event) {
                setTimeout(function() {
                    _this.close(event);
                }, 300);
            },
            search: function(event) {
                _this.searchTimeout(event);
            }
        });

        // 初始化资源
        this.initSource();
    };

    // setTimeout 代理
    autocomplete.delay = function( handler, delay ) {
        function handlerProxy() {
            return (typeof handler === "string" ? instance[handler] : handler)
                .apply(instance, arguments);
        }
        var instance = this;
        return setTimeout(handlerProxy, delay || 0 );
    };
    // 搜索线程
    autocomplete.searchTimeout = function(event) {
        clearTimeout(this.searching);
        this.searching = this.delay(function() {
            this.search(null, event);
        }, this.options.delay);
    };

    // 初始化资源
    autocomplete.initSource = function() {
        var array, url,
            that = this;
        if ($.isArray(this.options.source)) {
            array = this.options.source;

            function filter(array, value) {
                temp = [];
                for(var i = 0, len = array.length; i < len; i++) {
                    if(array[i].indexOf(value) != -1) {
                        temp.push(array[i]);
                    }
                }
                return temp;
            }
            this.source = function(request, response) {
                array = filter(array, request);
                response(array);
            };
        } else if (typeof this.options.source === "string") {
            url = this.options.source;
            this.source = function(request, response) {
                if (that.xhr) {
                    that.xhr.abort();
                }
                that.xhr = $.ajax({
                    url: url,
                    data: {value: request},
                    dataType: "json",
                    success: function(data) {
                        response(data);
                    },
                    error: function() {
                        response([]);
                    }
                });
            };
        } else {
            this.source = this.options.source;
        }
    };
    // 获取Val
    autocomplete._value = function() {
        return this.valueMethod.apply(this.element, arguments); 
    };
    // 数据查询
    autocomplete.search = function(value, event) {
        value = value != null ? value : this._value();

        this.close(event);

        if (value.length < this.options.minLength) {
            return; // this.close(event);
        }

        if (this.trigger("searching", event) === false) {
            return;
        }
        if(this.options.cache) {
            this.cacheKey = encodeURIComponent(value).replace(/\%/gi, '');
            if (this.cacheKey in this.cache) {
                this.response(this.cache[this.cacheKey]);
                return;
            }
        }

        return this.source(value, (function(_this){
            return function(content) {
                _this.response(content);                
            }
        })(this));
    };

    // 回调数据生成菜单
    autocomplete.response = function(content) {
        // 缓存
        if(this.options.cache) {
            this.cache[this.cacheKey] = content;
        }

        if($.isArray(content)) {
            content = {'data': content};
        }
        var render = template.compile(this.options.template);
        var html = render(content);

        this.menu.html(html).show();
        // this.menu.position($.extend({
        //     of: this.element
        // }, this.options.position));
        
        if (this.options.autoFocus) {
            this.active = this.menu.find(this.options.itemClass).first();        
            this.active.addClass('active');
        }
        // 绑定点击事件
        var _this = this;
        this.menu.find(this.options.itemClass).click(function(event) {
            _this.focus($(this));
            _this.select(event);
        })
    };

    // 移动数据项
    autocomplete.move = function(direction, event ) {
        if (!this.menu.is( ":visible")) {
            this.search(null, event );
            return;
        }

        // 阻止默认事件
        event.preventDefault();

        // 首尾元素移动后关闭菜单
        if(this.active && !this.active[direction + 'All'](this.options.itemClass).length) {
            this.close();
            return;
        }

        // 下一个数据项
        var next;
        if (this.active) {
            next = this.active[direction + 'All'](this.options.itemClass).first();
        }
        if (!next || !next.length || !this.active) {
            next = this.menu.find(this.options.itemClass)[direction === 'next' ? 'first' : 'last']();
        }

        this.focus(next, event);
    };

    // 设置选中焦点
    autocomplete.focus = function(next, event) {
        next.addClass('active').siblings().removeClass('active');
        this.active = next;
    }

    // 选中事件处理
    autocomplete.select = function(event) {        
        if(this.options.select)
            this.options.select(this.active);

        this.close();
    }

    // 关闭
    autocomplete.close = function(event ) {
        if (this.menu.is(":visible")) {
            this.menu.hide();
            this.active = null;
            if(typeof this.options.close === 'function')
                this.options.close();
            this.trigger("closed", event);
        }
    };
    // 初始化插件
    this.init();
}
