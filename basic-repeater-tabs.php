<?php
/*
Plugin Name: Basic Repeater Tabs for ACF
Plugin URI:  https://basicby.design
Description: Vertical and Horizontal Tabs for ACF Repeater Fields
Version:     1.0.0
Author:      Basic By Design
Author URI:  https://basicby.design
License:     MIT
License URI: https://opensource.org/licenses/MIT
*/

add_action( 'admin_enqueue_scripts', 'brt_for_acf_admin_enqueue_scripts' );
function brt_for_acf_admin_enqueue_scripts( $hook_suffix ) {
  // Enqueues jQuery
  wp_enqueue_script('jquery');
  
  $plugins = get_plugins();
  $acf_version = false;
  foreach ($plugins as $plugin) {
    if ($plugin['Name'] == 'Advanced Custom Fields PRO') {
      $acf_version = $plugin['Version'];
    }
  }
  
  wp_enqueue_style( 'brt_for_acf_styles', plugins_url('css/brt_for_acf.css', __FILE__ ), array(), '1.0.0', false);
  wp_enqueue_script( 'brt_for_acf_scripts', plugins_url('js/brt_for_acf.js', __FILE__ ), array(), '1.0.0', false);
  wp_enqueue_script( 'jQueryUI', 'https://code.jquery.com/ui/1.12.1/jquery-ui.js', array(), '1.12.1', false);
  
  if ($acf_version) {
    $brt_for_acf_args = array(
      'acf_version' => $acf_version
    );
    
    wp_localize_script( 'brt_for_acf_scripts', 'brt_for_acf_args', $brt_for_acf_args );
  }
}

add_action('acf/render_field_settings/type=repeater', 'brt_for_acf_settings');
function brt_for_acf_settings( $field ) {
	
  acf_render_field_setting( $field, array(
    'label'         => __('Basic Repeater Tabs'),
    'instructions'  => 'Turn on and select repeater tab orientation',
    'name'          => 'brt-orientation',
    'type'          => 'radio',
    'layout'        => 'horizontal',
    'choices'       => array(
      false => __('Off'),
      'vertical' => __('Vertical'),
      'horizontal' => __('Horizontal') 
    )
  ), true);

}

add_filter('acf/render_field/type=repeater', 'brt_for_acf_render_pre', 9, 1);
function brt_for_acf_render_pre( $field ) {
	if ( isset($field['brt-orientation']) && $field['brt-orientation'] ) {
	  echo '<div class="brt-activated brt-'.$field['brt-orientation'].'">';
  }
	
}

add_filter('acf/render_field/type=repeater', 'brt_for_acf_render_post', 11, 1);
function brt_for_acf_render_post( $field ) {
	if (isset($field['brt-orientation']) && !empty($field['brt-orientation']) ) {
    echo '</div>';
  }
	
}

