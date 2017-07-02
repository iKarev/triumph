import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import d3 from 'd3';
import resizeMixin from 'd3';
import getBondsData from './bonds.js'

const monthNames = [ "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December" ];

class LineChart extends React.Component {
    constructor(props){
        super(props);

        this.w = 900,
        this.h = 450;

        // this.monthNames = 

        this.maxDataPointsForDots = 50,
        this.transitionDuration = 1000;

        this.state = {
            periodTypes: ['week','month','quater','year','max'],
            valueTypes: ['price','yield','spread'],
            period: {dateType: 'month', valueType: 'price'}
        }

        this.svg = null,
        this.yAxisGroup = null,
        this.xAxisGroup = null,
        this.dataCirclesGroup = null,
        this.dataLinesGroup = null;

        this.draw = this.draw.bind(this);
        // this.generateData = this.generateData.bind(this);
        this.changeChartValues = this.changeChartValues.bind(this);

        // d3.select('#button').on('click', this.draw);
    }

    componentDidMount() { 
        this.draw(this.state.period);
    }

    render () {
        return (
            <div className="container">
                <div>
                {this.state.periodTypes.map((periodType, i) => 
                    <span className="radio-type" key={i}>
                        <input name="types" id={`period-type-${periodType}`} type="radio"
                            checked={periodType == this.state.period.dateType}
                            onChange={()=>{this.changeChartValues({type: 'date', value: periodType})}} />
                        <label htmlFor={`period-type-${periodType}`}>{periodType}</label>
                    </span>
                )}
                    <select className="select" 
                        onChange={(e)=>{this.changeChartValues({type: 'value', value: e.target.value})}}>
                        {this.state.valueTypes.map((valueType, i) => 
                            <option value={valueType} key={i}>{valueType}</option>
                        )}
                    </select>
                </div>
                <div id="chart"></div>
            </div>
        )
    }

    changeChartValues (data) {
        let period = this.state.period;
        if (data.type == 'value')
            period.valueType = data.value;
        else if (data.type == 'date')
            period.dateType = data.value;
        this.setState({ period })
        this.draw(period);
    }

    draw(period) {
        var data = getBondsData(period.dateType, new Date()); //this.generateData();
        var margin = 40;
        var max = d3.max(data, function(d) { return d[period.valueType] });
        var min = 0;
        var pointRadius = 4;
        var x = d3.time.scale().range([0, this.w - margin * 2]).domain([data[0].date, data[data.length - 1].date]);
        var y = d3.scale.linear().range([this.h - margin * 2, 0]).domain([min, max]);

        var xAxis = d3.svg.axis().scale(x).tickSize(this.h - margin * 2).tickPadding(10).ticks(7);
        var yAxis = d3.svg.axis().scale(y).orient('left').tickSize(-this.w + margin * 2).tickPadding(10);
        var t = null;

        this.svg = d3.select('#chart').select('svg').select('g');
        if (this.svg.empty()) {
            this.svg = d3.select('#chart')
                .append('svg:svg')
                    .attr('width', this.w)
                    .attr('height', this.h)
                    .attr('class', 'viz')
                .append('svg:g')
                    .attr('transform', 'translate(' + margin + ',' + margin + ')');
        }

        t = this.svg.transition().duration(this.transitionDuration);

        // y ticks and labels
        if (!this.yAxisGroup) {
            this.yAxisGroup = this.svg.append('svg:g')
                .attr('class', 'yTick')
                .call(yAxis);
        }
        else {
            t.select('.yTick').call(yAxis);
        }

        // x ticks and labels
        if (!this.xAxisGroup) {
            this.xAxisGroup = this.svg.append('svg:g')
                .attr('class', 'xTick')
                .call(xAxis);
        }
        else {
            t.select('.xTick').call(xAxis);
        }

        // Draw the lines
        if (!this.dataLinesGroup) {
            this.dataLinesGroup = this.svg.append('svg:g');
        }

        var dataLines = this.dataLinesGroup.selectAll('.data-line')
                .data([data]);

        var line = d3.svg.line()
            // assign the X function to plot our line as we wish
            .x(function(d,i) { 
                // verbose logging to show what's actually being done
                //console.log('Plotting X value for date: ' + d.date + ' using index: ' + i + ' to be at: ' + x(d.date) + ' using our xScale.');
                // return the X coordinate where we want to plot this datapoint
                //return x(i); 
                return x(d.date); 
            })
            .y(function(d) { 
                // verbose logging to show what's actually being done
                //console.log('Plotting Y value for data value: ' + d.value + ' to be at: ' + y(d.value) + " using our yScale.");
                // return the Y coordinate where we want to plot this datapoint
                //return y(d); 
                return y(d[period.valueType]); 
            })
            .interpolate("linear");

            /*
            .attr("d", d3.svg.line()
            .x(function(d) { return x(d.date); })
            .y(function(d) { return y(0); }))
            .transition()
            .delay(transitionDuration / 2)
            .duration(transitionDuration)
                .style('opacity', 1)
                            .attr("transform", function(d) { return "translate(" + x(d.date) + "," + y(d.value) + ")"; });
            */

        var garea = d3.svg.area()
            .interpolate("linear")
            .x(function(d) { 
                // verbose logging to show what's actually being done
                return x(d.date); 
            })
                    .y0(this.h - margin * 2)
            .y1(function(d) { 
                // verbose logging to show what's actually being done
                return y(d[period.valueType]); 
            });

        dataLines
            .enter()
            .append('svg:path')
                    .attr("class", "area")
                    .attr("d", garea(data));

        dataLines.enter().append('path')
            .attr('class', 'data-line')
            .style('opacity', 0.3)
            .attr("d", line(data));
            /*
            .transition()
            .delay(transitionDuration / 2)
            .duration(transitionDuration)
                .style('opacity', 1)
                .attr('x1', function(d, i) { return (i > 0) ? xScale(data[i - 1].date) : xScale(d.date); })
                .attr('y1', function(d, i) { return (i > 0) ? yScale(data[i - 1].value) : yScale(d.value); })
                .attr('x2', function(d) { return xScale(d.date); })
                .attr('y2', function(d) { return yScale(d.value); });
            */

        dataLines.transition()
            .attr("d", line)
            .duration(this.transitionDuration)
                .style('opacity', 1)
                .attr("transform", function(d, i) { return "translate(" + x(d[i].date) + ",0)"; });

        dataLines.exit()
            .transition()
            .attr("d", line)
            .duration(this.transitionDuration)
                .attr("transform", function(d, i) { return "translate(" + x(d[i].date) + "," + y(0) + ")"; })
                .style('opacity', 1e-6)
                .remove();

        d3.selectAll(".area").transition()
            .duration(this.transitionDuration)
            .attr("d", garea(data));

        // Draw the points
        if (!this.dataCirclesGroup) {
            this.dataCirclesGroup = this.svg.append('svg:g');
        }

        var circles = this.dataCirclesGroup.selectAll('.data-point')
            .data(data);

        circles
            .enter()
                .append('svg:circle')
                    .attr('class', 'data-point')
                    .style('opacity', 1e-6)
                    .attr('cx', function(d) { return x(d.date) })
                    .attr('cy', function() { return y(0) })
                    .attr('r', function() { return (data.length <= this.maxDataPointsForDots) ? pointRadius : 0 })
                .transition()
                .duration(this.transitionDuration)
                    .style('opacity', 1)
                    .attr('cx', function(d) { return x(d.date) })
                    .attr('cy', function(d) { return y(d[period.valueType]) });

        circles
            .transition()
            .duration(this.transitionDuration)
                .attr('cx', function(d) { return x(d.date) })
                .attr('cy', function(d) { return y(d[period.valueType]) })
                .attr('r', function() { return (data.length <= this.maxDataPointsForDots) ? pointRadius : 0 })
                .style('opacity', 1);

        circles
            .exit()
                .transition()
                .duration(this.transitionDuration)
                    // Leave the cx transition off. Allowing the points to fall where they lie is best.
                    //.attr('cx', function(d, i) { return xScale(i) })
                    .attr('cy', function() { return y(0) })
                    .style("opacity", 1e-6)
                    .remove();

        $('svg circle').tipsy({
            gravity: 'w', 
            html: true, 
            title: function() {
                let d = this.__data__;
                let pDate = d.date;
                return `Date: ${pDate.getDate()} ${monthNames[pDate.getMonth()]} ${pDate.getFullYear()}<br />${period.valueType}: ${d[period.valueType]}`; 
            }
        });
    }

    // generateData() {
    //     var data = [];
    //     var i = Math.max(Math.round(Math.random()*100), 3);

    //     while (i--) {
    //         var date = new Date();
    //         date.setDate(date.getDate() - i);
    //         date.setHours(0, 0, 0, 0);
    //         data.push({'value' : Math.round(Math.random()*1200), 'date' : date});
    //     }
    //     console.log(data);
    //     return data;
    // }
}

export default LineChart;

(function($) {
    
    function maybeCall(thing, ctx) {
        return (typeof thing == 'function') ? (thing.call(ctx)) : thing;
    }
    
    function Tipsy(element, options) {
        this.$element = $(element);
        this.options = options;
        this.enabled = true;
        this.fixTitle();
    }
    
    Tipsy.prototype = {
        show: function() {
            var title = this.getTitle();
            if (title && this.enabled) {
                var $tip = this.tip();
                
                $tip.find('.tipsy-inner')[this.options.html ? 'html' : 'text'](title);
                $tip[0].className = 'tipsy'; // reset classname in case of dynamic gravity
                $tip.remove().css({top: 0, left: 0, visibility: 'hidden', display: 'block'}).prependTo(document.body);
                
                var pos = $.extend({}, this.$element.offset(), {
                    width: this.$element[0].offsetWidth || 0,
                    height: this.$element[0].offsetHeight || 0
                });

                if (typeof this.$element[0].nearestViewportElement == 'object') {
                    // SVG
                    var el = this.$element[0];
                    var rect = el.getBoundingClientRect();
                    pos.width = rect.width;
                    pos.height = rect.height;
                }

                
                var actualWidth = $tip[0].offsetWidth,
                    actualHeight = $tip[0].offsetHeight,
                    gravity = maybeCall(this.options.gravity, this.$element[0]);
                
                var tp;
                switch (gravity.charAt(0)) {
                    case 'n':
                        tp = {top: pos.top + pos.height + this.options.offset, left: pos.left + pos.width / 2 - actualWidth / 2};
                        break;
                    case 's':
                        tp = {top: pos.top - actualHeight - this.options.offset, left: pos.left + pos.width / 2 - actualWidth / 2};
                        break;
                    case 'e':
                        tp = {top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left - actualWidth - this.options.offset};
                        break;
                    case 'w':
                        tp = {top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left + pos.width + this.options.offset};
                        break;
                }
                
                if (gravity.length == 2) {
                    if (gravity.charAt(1) == 'w') {
                        tp.left = pos.left + pos.width / 2 - 15;
                    } else {
                        tp.left = pos.left + pos.width / 2 - actualWidth + 15;
                    }
                }
                
                $tip.css(tp).addClass('tipsy-' + gravity);
                $tip.find('.tipsy-arrow')[0].className = 'tipsy-arrow tipsy-arrow-' + gravity.charAt(0);
                if (this.options.className) {
                    $tip.addClass(maybeCall(this.options.className, this.$element[0]));
                }
                
                if (this.options.fade) {
                    $tip.stop().css({opacity: 0, display: 'block', visibility: 'visible'}).animate({opacity: this.options.opacity});
                } else {
                    $tip.css({visibility: 'visible', opacity: this.options.opacity});
                }

                var t = this;
                var set_hovered  = function(set_hover){
                    return function(){
                        t.$tip.stop();
                        t.tipHovered = set_hover;
                        if (!set_hover){
                            if (t.options.delayOut === 0) {
                                t.hide();
                            } else {
                                setTimeout(function() { 
                                    if (t.hoverState == 'out') t.hide(); }, t.options.delayOut);
                            }
                        }
                    };
                };
            $tip.hover(set_hovered(true), set_hovered(false));
            }
        },
        
        hide: function() {
            if (this.options.fade) {
                this.tip().stop().fadeOut(function() { $(this).remove(); });
            } else {
                this.tip().remove();
            }
        },
        
        fixTitle: function() {
            var $e = this.$element;
            
            if ($e.attr('title') || typeof($e.attr('original-title')) != 'string') {
                $e.attr('original-title', $e.attr('title') || '').removeAttr('title');
            }

            if (typeof $e[0].nearestViewportElement == 'object'){                                                        
                if ($e.children('title').length){
                    $e.append('<original-title>' + ($e.children('title').text() || '') + '</original-title>')
                        .children('title').remove();
                }
            }
        },
        
        getTitle: function() {
            
            var title, $e = this.$element, o = this.options;
            this.fixTitle();

            if (typeof o.title == 'string') {
                var title_name = o.title == 'title' ? 'original-title' : o.title;
                if ($e.children(title_name).length){
                    title = $e.children(title_name).html();
                } else{
                    title = $e.attr(title_name);
                }
                
            } else if (typeof o.title == 'function') {
                title = o.title.call($e[0]);
            }
            title = ('' + title).replace(/(^\s*|\s*$)/, "");
            return title || o.fallback;
        },
        
        tip: function() {
            if (!this.$tip) {
                this.$tip = $('<div class="tipsy"></div>').html('<div class="tipsy-arrow"></div><div class="tipsy-inner"></div>');
            }
            return this.$tip;
        },
        
        validate: function() {
            if (!this.$element[0].parentNode) {
                this.hide();
                this.$element = null;
                this.options = null;
            }
        },
        
        enable: function() { this.enabled = true; },
        disable: function() { this.enabled = false; },
        toggleEnabled: function() { this.enabled = !this.enabled; }
    };
    
    $.fn.tipsy = function(options) {
        
        if (options === true) {
            return this.data('tipsy');
        } else if (typeof options == 'string') {
            var tipsy = this.data('tipsy');
            if (tipsy) tipsy[options]();
            return this;
        }
        
        options = $.extend({}, $.fn.tipsy.defaults, options);

        if (options.hoverlock && options.delayOut === 0) {
        options.delayOut = 100;
    }
        
        function get(ele) {
            var tipsy = $.data(ele, 'tipsy');
            if (!tipsy) {
                tipsy = new Tipsy(ele, $.fn.tipsy.elementOptions(ele, options));
                $.data(ele, 'tipsy', tipsy);
            }
            return tipsy;
        }
        
        function enter() {
            var tipsy = get(this);
            tipsy.hoverState = 'in';
            if (options.delayIn === 0) {
                tipsy.show();
            } else {
                tipsy.fixTitle();
                setTimeout(function() { if (tipsy.hoverState == 'in') tipsy.show(); }, options.delayIn);
            }
        }
        
        function leave() {
            var tipsy = get(this);
            tipsy.hoverState = 'out';
            if (options.delayOut === 0) {
                tipsy.hide();
            } else {
                var to = function() {
                    if (!tipsy.tipHovered || !options.hoverlock){
                        if (tipsy.hoverState == 'out') tipsy.hide(); 
                    }
                };
                setTimeout(to, options.delayOut);
            }    
        }

        if (options.trigger != 'manual') {
            var binder = options.live ? 'live' : 'bind',
                eventIn = options.trigger == 'hover' ? 'mouseenter' : 'focus',
                eventOut = options.trigger == 'hover' ? 'mouseleave' : 'blur';
            this[binder](eventIn, enter)[binder](eventOut, leave);
        }
        
        return this;
        
    };
    
    $.fn.tipsy.defaults = {
        className: null,
        delayIn: 0,
        delayOut: 0,
        fade: false,
        fallback: '',
        gravity: 'n',
        html: false,
        live: false,
        offset: 0,
        opacity: 0.8,
        title: 'title',
        trigger: 'hover',
        hoverlock: false
    };
    
    // Overwrite this method to provide options on a per-element basis.
    // For example, you could store the gravity in a 'tipsy-gravity' attribute:
    // return $.extend({}, options, {gravity: $(ele).attr('tipsy-gravity') || 'n' });
    // (remember - do not modify 'options' in place!)
    $.fn.tipsy.elementOptions = function(ele, options) {
        return $.metadata ? $.extend({}, options, $(ele).metadata()) : options;
    };
    
    $.fn.tipsy.autoNS = function() {
        return $(this).offset().top > ($(document).scrollTop() + $(window).height() / 2) ? 's' : 'n';
    };
    
    $.fn.tipsy.autoWE = function() {
        return $(this).offset().left > ($(document).scrollLeft() + $(window).width() / 2) ? 'e' : 'w';
    };
    
    /**
     * yields a closure of the supplied parameters, producing a function that takes
     * no arguments and is suitable for use as an autogravity function like so:
     *
     * @param margin (int) - distance from the viewable region edge that an
     *        element should be before setting its tooltip's gravity to be away
     *        from that edge.
     * @param prefer (string, e.g. 'n', 'sw', 'w') - the direction to prefer
     *        if there are no viewable region edges effecting the tooltip's
     *        gravity. It will try to vary from this minimally, for example,
     *        if 'sw' is preferred and an element is near the right viewable 
     *        region edge, but not the top edge, it will set the gravity for
     *        that element's tooltip to be 'se', preserving the southern
     *        component.
     */
    $.fn.tipsy.autoBounds = function(margin, prefer) {
        return function() {
            var dir = {ns: prefer[0], ew: (prefer.length > 1 ? prefer[1] : false)},
                boundTop = $(document).scrollTop() + margin,
                boundLeft = $(document).scrollLeft() + margin,
                $this = $(this);

            if ($this.offset().top < boundTop) dir.ns = 'n';
            if ($this.offset().left < boundLeft) dir.ew = 'w';
            if ($(window).width() + $(document).scrollLeft() - $this.offset().left < margin) dir.ew = 'e';
            if ($(window).height() + $(document).scrollTop() - $this.offset().top < margin) dir.ns = 's';

            return dir.ns + (dir.ew ? dir.ew : '');
        };
    };
})($);