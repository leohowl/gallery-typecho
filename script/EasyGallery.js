/**
 * Created by HANSN-CZ-P01 on 3/14/2019.
 */
!(function(window){
  'use strict';
  function EasyGallery(opts) {
    // 设置默认值
    this.opts = opts;
    this.wrap = $(opts.wrap);
    this.item = this.wrap.find(opts.item);
    this.displayContainer = opts.displayContainer ? $(opts.displayContainer) : $('#_easygallery');
    this.displayImage = this.displayContainer.find('.image-area');
    this.btnZoomIn = opts.btnZoomIn ? $(opts.btnZoomIn) : $('#_easygallery .tool .zoom-in');
    this.btnZoomOut = opts.btnZoomOut ? $(opts.btnZoomOut) : $('#_easygallery .tool .zoom-out');
    this.btnFull = opts.btnFull ? $(opts.btnFull) : $('#_easygallery .tool .full');
    this.btnExit = opts.btnExit ? $(opts.btnExit) : $('#_easygallery .tool .exit');
    this.btnBg = opts.btnBg ? $(opts.btnBg) : $('#_easygallery .bg')
    this.checkTimer = null;
    this.imageInstance = null;
    this.imageOriginWidth = 0;
    this.imageOriginHeight = 0;
    // 鼠标是否按压
    this.mouseDown = false;
    this.position = {
      x: 0,
      y: 0,
      left: 0,
      top: 0,
      tmpLeft: 0,
      tmpTop: 0
    };
    // 变形阈值
    this.sizeThreshold = 0.94;
    this.scale = 1;
    // 缩放步长
    this.scaleStep = 0.2;
    // 缩放限制
    this.scaleLimit = 5;
    this.fullScreenStatus = false;
    this.init();
  }

  EasyGallery.prototype = {
    constructor: 'EasyGallery',
    init: function(){
      var that = this;
      this.btnExit.on('click', function(){
        that.exit();
      })
      this.btnBg.on('click', function(){
        that.exit();
      })
      // 放大图片
      this.btnZoomIn.on('click', function(){
        if(
          (that.scale + that.scaleStep) > that.scaleLimit
          || (that.scale + that.scaleStep) < (1/that.scaleLimit)
        ) {
          return false;
        }
        // 计算放大系数
        that.scale = that.scale + that.scaleStep;
        // 进行缩放
        that.position.left = that.position.left - (that.imageOriginWidth * that.scaleStep / 2);
        that.position.top = that.position.top - (that.imageOriginHeight * that.scaleStep / 2);
        that.displayImage.stop(true, false).animate({
          width: that.imageOriginWidth * that.scale,
          height: that.imageOriginHeight * that.scale,
          left: that.position.left,
          top: that.position.top
        })

      })
      // 放大图片
      this.btnZoomOut.on('click', function(){
        if(
          (that.scale - that.scaleStep) > that.scaleLimit
          || (that.scale - that.scaleStep) < (1 / that.scaleLimit)
        ) {
          return false;
        }
        // 计算放大系数
        that.scale = that.scale - that.scaleStep;
        // 进行缩放
        that.position.left = that.position.left + (that.imageOriginWidth * that.scaleStep / 2);
        that.position.top = that.position.top + (that.imageOriginHeight * that.scaleStep / 2);
        that.displayImage.stop(true, false).animate({
          width: that.imageOriginWidth * that.scale,
          height: that.imageOriginHeight * that.scale,
          left: that.position.left,
          top: that.position.top
        })
      })

      this.btnFull.on('click', function(){
        that.fullScreen();
      })
      this.item.on('click', function(){
        that.show($(this)[0].src)
      })
      this.displayImage.on('mousedown', function(e){
        //获取x坐标和y坐标
        that.position.x = e.clientX;
        that.position.y = e.clientY;

        //开关打开
        that.mouseDown = true;
      }).on('mousemove', function(e){
        if (that.mouseDown === false) {
          return;
        }
        //获取x和y
        var nx = e.clientX;
        var ny = e.clientY;
        //计算移动后的左偏移量和顶部的偏移量
        that.position.tmpLeft = nx - that.position.x + that.position.left;
        that.position.tmpTop = ny - that.position.y + that.position.top;

        $(this).css({
          left: that.position.tmpLeft,
          top: that.position.tmpTop
        })
      }).on('mouseup', function(e){
        that.mouseDown = false;
        // 更新position
        that.position.left = that.position.tmpLeft;
        that.position.top = that.position.tmpTop;
      });
    },
    show: function(src) {
      // 隐藏右侧滑块
      this.scale = 1;
      this.imageInstance = new Image();
      this.imageInstance.src = src;
      this.imageLoadCheck();
    },
    imageLoadCheck: function(){
      var that = this;
      clearTimeout(this.checkTimer);
      if(!this.imageInstance.complete){
        // 未加载完成
        this.checkTimer = setTimeout(function(){
          that.imageLoadCheck()
        }, 300)
        return null;
      }
      // 设置图片
      this.setImage(true)
      document.body.style.cssText = 'overflow:hidden;+overflow:none;_overflow:none;padding:0;';
      this.displayContainer.fadeIn();
    },
    setImage: function(thresholdCheck) {
      var viewWidth = $(window).width();
      var viewHeight = $(window).height();
      var imageWidth = this.imageInstance.width;
      var imageHeight = this.imageInstance.height;
      if(
        thresholdCheck
        && ((imageWidth > viewWidth * this.sizeThreshold) || (imageHeight > viewHeight * this.sizeThreshold))
      ) {
        // 首次加载时需要阈值检测，图片大于变形阈值，需要尺寸校正
        // 计算缩放比例
        // this.imageOriginWidth = imageWidth
        // this.imageOriginHeight = imageHeight
        var x = (imageWidth - viewWidth) / viewWidth;
        var y = (imageHeight - viewHeight) / viewHeight;
        var originProportion = imageWidth / imageHeight;
        if(y > x){
          // 根据y方向进行变换
          this.imageInstance.height = viewHeight * this.sizeThreshold;
          this.imageInstance.width = originProportion * viewHeight * this.sizeThreshold;
        } else {
          this.imageInstance.width = viewWidth * this.sizeThreshold;
          this.imageInstance.height = viewWidth * this.sizeThreshold / originProportion;
        }
        imageWidth = this.imageInstance.width;
        imageHeight = this.imageInstance.height;
        this.imageOriginWidth = imageWidth
        this.imageOriginHeight = imageHeight
        var src = this.imageInstance.src.toString();
        this.displayImage.css({
          'background':'url("'+src+'") no-repeat center center',
          'background-size':'cover'
        })
      }

      // 图片赋值
      // this.displayImage[0].src = this.imageInstance.src
      // 居中显示
      this.position.left  = (viewWidth - imageWidth) / 2;
      this.position.top  = (viewHeight - imageHeight) / 2;
      this.displayImage.css({
        width: this.imageInstance.width,
        height: this.imageInstance.height,
        left: this.position.left,
        top: this.position.top
      })
    },
    exit: function() {
      // 显示右侧滑块
      this.displayContainer.fadeOut();
      document.body.style.cssText = 'overflow:auto;+overflow:auto;_overflow:auto;padding:0;';
    },
    fullScreen: function() {
      if(!this.fullScreenStatus){
        // 进行全屏展示
        this.fullScreenStatus = true;
        var el = document.documentElement;
        var rfs = el.requestFullScreen || el.webkitRequestFullScreen ||
          el.mozRequestFullScreen || el.msRequestFullScreen;
        if (rfs) { //typeof rfs != "undefined" && rfs
          rfs.call(el);
        } else if (typeof window.ActiveXObject !== "undefined") {
          //for IE，这里其实就是模拟了按下键盘的F11，使浏览器全屏
          var wscript = new ActiveXObject("WScript.Shell");
          if (wscript !== null) {
            wscript.SendKeys("{F11}");
          }
        }
      } else {
        // 退出全屏展示
        this.fullScreenStatus = false;
        var el = document;
        var cfs = el.cancelFullScreen || el.webkitCancelFullScreen ||
          el.mozCancelFullScreen || el.exitFullScreen;
        if (cfs) { //typeof cfs != "undefined" && cfs
          cfs.call(el);
        } else if (typeof window.ActiveXObject !== "undefined") {
          //for IE，这里和fullScreen相同，模拟按下F11键退出全屏
          var wscript = new ActiveXObject("WScript.Shell");
          if (wscript !== null) {
            wscript.SendKeys("{F11}");
          }
        }
      }
    }
  }

  window.EasyGallery = EasyGallery;
})(window)