// assets/block.js — Gutenberg Block for BrandShuo Attribution Checker
(function(wp) {
  var registerBlockType = wp.blocks.registerBlockType;
  var createElement = wp.element.createElement;
  var InspectorControls = wp.blockEditor.InspectorControls;
  var PanelBody = wp.components.PanelBody;
  var SelectControl = wp.components.SelectControl;
  var TextControl = wp.components.TextControl;

  registerBlockType('brandshuo/attribution-checker', {
    title: 'BrandShuo Attribution Checker',
    description: 'Embed the affiliate link attribution checker on your page.',
    icon: 'admin-links',
    category: 'widgets',
    attributes: {
      mode: { type: 'string', default: 'single' },
      placeholder: { type: 'string', default: 'Paste an affiliate link...' }
    },
    edit: function(props) {
      var atts = props.attributes;
      return createElement('div', {},
        createElement(InspectorControls, {},
          createElement(PanelBody, { title: 'Settings', initialOpen: true },
            createElement(SelectControl, {
              label: 'Mode',
              value: atts.mode,
              options: [
                { label: 'Single URL', value: 'single' },
                { label: 'Batch (up to 50)', value: 'batch' }
              ],
              onChange: function(v) { props.setAttributes({ mode: v }); }
            }),
            createElement(TextControl, {
              label: 'Placeholder',
              value: atts.placeholder,
              onChange: function(v) { props.setAttributes({ placeholder: v }); }
            })
          )
        ),
        createElement('div', {
          style: {
            padding: '20px', background: '#f8fafc', border: '2px dashed #e2e8f0',
            borderRadius: '12px', textAlign: 'center', color: '#64748b'
          }
        },
          createElement('strong', {}, '🔗 BrandShuo Attribution Checker'),
          createElement('p', { style: { marginTop: '8px', fontSize: '13px' } },
            'Mode: ' + atts.mode + ' · The checker will appear here on the frontend.'
          )
        )
      );
    },
    save: function() { return null; } // Dynamic block, rendered server-side
  });
})(window.wp);
