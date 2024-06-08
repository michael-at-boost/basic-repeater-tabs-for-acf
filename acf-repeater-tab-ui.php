<?php
/*
Plugin Name: ACF Repeater Tab UI
Plugin URI:  https://notlive.fr
Description: Vertical and Horizontal Tabs for ACF Repeaters
Version:     0.9.0
Author:      notlive.fr
Author URI:  https://notlive.fr
License:     MIT
License URI: https://opensource.org/licenses/MIT
*/

add_action( 'admin_enqueue_scripts', 'acf_rtui_admin_enqueue_scripts' );
function acf_rtui_admin_enqueue_scripts( $hook_suffix ) {
  wp_enqueue_script('jquery');
  wp_enqueue_style( 'acf_rtui_styles', plugins_url('css/acf_rtui.css', __FILE__ ), array(), '1.0.0', false);
  wp_enqueue_script( 'acf_rtui_scripts', plugins_url('js/acf_rtui.js', __FILE__ ), array('jquery'), '1.0.0', false);
}

add_action('acf/render_field_presentation_settings/type=repeater', 'acf_rtui_settings');
function acf_rtui_settings( $field ) {
	
  acf_render_field_setting( $field, array(
    'label'         => __('Repeater Tab UI'),
    'instructions'  => 'Turn on and select repeater tab orientation',
    'name'          => 'rtui-orientation',
    'type'          => 'radio',
    'layout'        => 'horizontal',
    'choices'       => array(
      false => __('Off'),
      'vertical' => __('Vertical'),
      'horizontal' => __('Horizontal') 
    )
  ), true);

}

add_filter('acf/render_field/type=repeater', 'acf_rtui_render_pre', 9, 1);
function acf_rtui_render_pre( $field ) {
	if ( isset($field['rtui-orientation']) && $field['rtui-orientation'] ) {
	  echo '<div class="rtui-activated rtui-'.esc_attr($field['rtui-orientation']).'">';
  }
	
}

add_filter('acf/render_field/type=repeater', 'acf_rtui_render_post', 11, 1);
function acf_rtui_render_post( $field ) {
	if (isset($field['rtui-orientation']) && !empty($field['rtui-orientation']) ) {
    echo '</div>';
  }
	
}
