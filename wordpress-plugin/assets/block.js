(function(wp){
  var r=wp.blocks.registerBlockType,e=wp.element.createElement,c=wp.components;

  r('brandshuo/attribution-checker',{
    title:'BrandShuo Attribution Checker',
    description:'Professional affiliate link analysis. Identify network, publisher, risk & incrementality.',
    icon: (()=>e('svg',{width:24,height:24,viewBox:'0 0 24 24',fill:'none'},e('path',{d:'M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.71 1.71',stroke:'currentColor','stroke-width':2})))(),
    category:'widgets',keywords:['affiliate','attribution','link','publisher','network'],
    attributes:{tab:{type:'string',default:'single'}},
    edit:function(p){
      return e('div',{},
        e(wp.blockEditor.InspectorControls,{},
          e(c.PanelBody,{title:'Settings',initialOpen:true},
            e(c.SelectControl,{label:'Default Tab',value:p.attributes.tab,
              options:[{label:'Single URL',value:'single'},{label:'Batch Analysis',value:'batch'}],
              onChange:function(v){p.setAttributes({tab:v})}}
            )
          )
        ),
        e('div',{style:{padding:'24px',background:'#f8fafc',border:'2px dashed #e2e8f0',borderRadius:'16px',textAlign:'center'}},
          e('div',{style:{fontSize:'32px',marginBottom:'12px'}},'🔗'),
          e('strong',{style:{display:'block',fontSize:'16px',marginBottom:'6px'}},'BrandShuo Attribution Checker'),
          e('p',{style:{color:'#64748b',fontSize:'13px',margin:0}},'Paste any affiliate link to identify the network, publisher, risk level, and incrementality.'),
          e('p',{style:{color:'#94a3b8',fontSize:'11px',marginTop:'4px'}},'25+ networks · 605 publishers · 52 regions')
        )
      );
    },
    save:function(){return null}
  });
})(window.wp);
