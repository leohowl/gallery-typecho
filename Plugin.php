<?php

/**
 * 画廊插件
 *
 * @package Gallery
 * @author Leohowl
 * @version 0.0.1
 * @link https://www.doctype.com.cn
 */
class Gallery_Plugin implements Typecho_Plugin_Interface
{
  /**
   * 激活插件方法,如果激活失败,直接抛出异常
   *
   * @access public
   * @return void
   * @throws Typecho_Plugin_Exception
   */
  public static function activate()
  {
    // 激活输出头部和底部
    Typecho_Plugin::factory('Widget_Archive')->header = array('Gallery_Plugin', 'header');
    Typecho_Plugin::factory('Widget_Archive')->footer = array('Gallery_Plugin', 'footer');
  }

  /**
   * 禁用插件方法,如果禁用失败,直接抛出异常
   *
   * @static
   * @access public
   * @return void
   * @throws Typecho_Plugin_Exception
   */
  public static function deactivate(){}

  /**
   * 获取插件配置面板
   *
   * @access public
   * @param Typecho_Widget_Helper_Form $form 配置面板
   * @return void
   */
  public static function config(Typecho_Widget_Helper_Form $form)
  {
    /**
     * 设置图片的容器和item
     */
    $wrap = new Typecho_Widget_Helper_Form_Element_Text('wrap', NULL, '#main', _t('图片容器选择器'));
    $form->addInput($wrap);
    $item = new Typecho_Widget_Helper_Form_Element_Text('item', NULL, '.img', _t('图片Item选择器'));
    $form->addInput($item);

  }

  /**
   * 个人用户的配置面板
   *
   * @access public
   * @param Typecho_Widget_Helper_Form $form
   * @return void
   */
  public static function personalConfig(Typecho_Widget_Helper_Form $form){}


  public static function header()
  {
    $css = Helper::options()->pluginUrl . '/Gallery/style/style.css';
    echo '<link rel="stylesheet" type="text/css" href="' . $css . '" />';
  }

  public static function footer()
  {
    $wrap = htmlspecialchars(Typecho_Widget::widget('Widget_Options')->plugin('Gallery')->wrap);
    $item = htmlspecialchars(Typecho_Widget::widget('Widget_Options')->plugin('Gallery')->item);
    $js = Helper::options()->pluginUrl . '/Gallery/script/EasyGallery.js';
    // 输出DOM
    echo '
      <div id="_easygallery">
        <div class="bg"></div>
        <div class="image-area stop-pop"></div>
        <div class="tool stop-pop">
          <div class="zoom-in">大</div>
          <div class="zoom-out">小</div>
          <div class="full">全</div>
          <div class="exit">退</div>
        </div>
        <div class="prev  stop-pop"></div>
        <div class="next  stop-pop"></div>
      </div>
    ';
    echo '<script type="text/javascript" src="'. $js .'"></script>';
    echo '<script>
            var gallery = new EasyGallery({
              wrap: "'.$wrap.'",
              item: "'.$item.'"
            })
          </script>';
  }
}
