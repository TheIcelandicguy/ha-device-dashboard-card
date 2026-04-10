function e(e,t,i,o){var a,r=arguments.length,n=r<3?t:null===o?o=Object.getOwnPropertyDescriptor(t,i):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)n=Reflect.decorate(e,t,i,o);else for(var s=e.length-1;s>=0;s--)(a=e[s])&&(n=(r<3?a(n):r>3?a(t,i,n):a(t,i))||n);return r>3&&n&&Object.defineProperty(t,i,n),n}"function"==typeof SuppressedError&&SuppressedError;const t=globalThis,i=t.ShadowRoot&&(void 0===t.ShadyCSS||t.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,o=Symbol(),a=new WeakMap;let r=class{constructor(e,t,i){if(this._$cssResult$=!0,i!==o)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o;const t=this.t;if(i&&void 0===e){const i=void 0!==t&&1===t.length;i&&(e=a.get(t)),void 0===e&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),i&&a.set(t,e))}return e}toString(){return this.cssText}};const n=(e,...t)=>{const i=1===e.length?e[0]:t.reduce((t,i,o)=>t+(e=>{if(!0===e._$cssResult$)return e.cssText;if("number"==typeof e)return e;throw Error("Value passed to 'css' function must be a 'css' function result: "+e+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+e[o+1],e[0]);return new r(i,e,o)},s=i?e=>e:e=>e instanceof CSSStyleSheet?(e=>{let t="";for(const i of e.cssRules)t+=i.cssText;return(e=>new r("string"==typeof e?e:e+"",void 0,o))(t)})(e):e,{is:l,defineProperty:c,getOwnPropertyDescriptor:d,getOwnPropertyNames:p,getOwnPropertySymbols:u,getPrototypeOf:h}=Object,g=globalThis,f=g.trustedTypes,v=f?f.emptyScript:"",b=g.reactiveElementPolyfillSupport,m=(e,t)=>e,x={toAttribute(e,t){switch(t){case Boolean:e=e?v:null;break;case Object:case Array:e=null==e?e:JSON.stringify(e)}return e},fromAttribute(e,t){let i=e;switch(t){case Boolean:i=null!==e;break;case Number:i=null===e?null:Number(e);break;case Object:case Array:try{i=JSON.parse(e)}catch(e){i=null}}return i}},y=(e,t)=>!l(e,t),_={attribute:!0,type:String,converter:x,reflect:!1,useDefault:!1,hasChanged:y};Symbol.metadata??=Symbol("metadata"),g.litPropertyMetadata??=new WeakMap;let w=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=_){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){const i=Symbol(),o=this.getPropertyDescriptor(e,i,t);void 0!==o&&c(this.prototype,e,o)}}static getPropertyDescriptor(e,t,i){const{get:o,set:a}=d(this.prototype,e)??{get(){return this[t]},set(e){this[t]=e}};return{get:o,set(t){const r=o?.call(this);a?.call(this,t),this.requestUpdate(e,r,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??_}static _$Ei(){if(this.hasOwnProperty(m("elementProperties")))return;const e=h(this);e.finalize(),void 0!==e.l&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(m("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(m("properties"))){const e=this.properties,t=[...p(e),...u(e)];for(const i of t)this.createProperty(i,e[i])}const e=this[Symbol.metadata];if(null!==e){const t=litPropertyMetadata.get(e);if(void 0!==t)for(const[e,i]of t)this.elementProperties.set(e,i)}this._$Eh=new Map;for(const[e,t]of this.elementProperties){const i=this._$Eu(e,t);void 0!==i&&this._$Eh.set(i,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){const t=[];if(Array.isArray(e)){const i=new Set(e.flat(1/0).reverse());for(const e of i)t.unshift(s(e))}else void 0!==e&&t.push(s(e));return t}static _$Eu(e,t){const i=t.attribute;return!1===i?void 0:"string"==typeof i?i:"string"==typeof e?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??=new Set).add(e),void 0!==this.renderRoot&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){const e=new Map,t=this.constructor.elementProperties;for(const i of t.keys())this.hasOwnProperty(i)&&(e.set(i,this[i]),delete this[i]);e.size>0&&(this._$Ep=e)}createRenderRoot(){const e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return((e,o)=>{if(i)e.adoptedStyleSheets=o.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet);else for(const i of o){const o=document.createElement("style"),a=t.litNonce;void 0!==a&&o.setAttribute("nonce",a),o.textContent=i.cssText,e.appendChild(o)}})(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,t,i){this._$AK(e,i)}_$ET(e,t){const i=this.constructor.elementProperties.get(e),o=this.constructor._$Eu(e,i);if(void 0!==o&&!0===i.reflect){const a=(void 0!==i.converter?.toAttribute?i.converter:x).toAttribute(t,i.type);this._$Em=e,null==a?this.removeAttribute(o):this.setAttribute(o,a),this._$Em=null}}_$AK(e,t){const i=this.constructor,o=i._$Eh.get(e);if(void 0!==o&&this._$Em!==o){const e=i.getPropertyOptions(o),a="function"==typeof e.converter?{fromAttribute:e.converter}:void 0!==e.converter?.fromAttribute?e.converter:x;this._$Em=o;const r=a.fromAttribute(t,e.type);this[o]=r??this._$Ej?.get(o)??r,this._$Em=null}}requestUpdate(e,t,i,o=!1,a){if(void 0!==e){const r=this.constructor;if(!1===o&&(a=this[e]),i??=r.getPropertyOptions(e),!((i.hasChanged??y)(a,t)||i.useDefault&&i.reflect&&a===this._$Ej?.get(e)&&!this.hasAttribute(r._$Eu(e,i))))return;this.C(e,t,i)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(e,t,{useDefault:i,reflect:o,wrapped:a},r){i&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,r??t??this[e]),!0!==a||void 0!==r)||(this._$AL.has(e)||(this.hasUpdated||i||(t=void 0),this._$AL.set(e,t)),!0===o&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}const e=this.scheduleUpdate();return null!=e&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[e,t]of this._$Ep)this[e]=t;this._$Ep=void 0}const e=this.constructor.elementProperties;if(e.size>0)for(const[t,i]of e){const{wrapped:e}=i,o=this[t];!0!==e||this._$AL.has(t)||void 0===o||this.C(t,void 0,i,o)}}let e=!1;const t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach(e=>e.hostUpdate?.()),this.update(t)):this._$EM()}catch(t){throw e=!1,this._$EM(),t}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach(e=>e.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach(e=>this._$ET(e,this[e])),this._$EM()}updated(e){}firstUpdated(e){}};w.elementStyles=[],w.shadowRootOptions={mode:"open"},w[m("elementProperties")]=new Map,w[m("finalized")]=new Map,b?.({ReactiveElement:w}),(g.reactiveElementVersions??=[]).push("2.1.2");const $=globalThis,k=e=>e,C=$.trustedTypes,S=C?C.createPolicy("lit-html",{createHTML:e=>e}):void 0,A="$lit$",z=`lit$${Math.random().toFixed(9).slice(2)}$`,M="?"+z,T=`<${M}>`,O=document,P=()=>O.createComment(""),B=e=>null===e||"object"!=typeof e&&"function"!=typeof e,E=Array.isArray,D="[ \t\n\f\r]",F=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,I=/-->/g,L=/>/g,R=RegExp(`>|${D}(?:([^\\s"'>=/]+)(${D}*=${D}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),N=/'/g,j=/"/g,U=/^(?:script|style|textarea|title)$/i,H=e=>(t,...i)=>({_$litType$:e,strings:t,values:i}),V=H(1),W=H(2),G=Symbol.for("lit-noChange"),q=Symbol.for("lit-nothing"),Y=new WeakMap,Z=O.createTreeWalker(O,129);function Q(e,t){if(!E(e)||!e.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==S?S.createHTML(t):t}const X=(e,t)=>{const i=e.length-1,o=[];let a,r=2===t?"<svg>":3===t?"<math>":"",n=F;for(let t=0;t<i;t++){const i=e[t];let s,l,c=-1,d=0;for(;d<i.length&&(n.lastIndex=d,l=n.exec(i),null!==l);)d=n.lastIndex,n===F?"!--"===l[1]?n=I:void 0!==l[1]?n=L:void 0!==l[2]?(U.test(l[2])&&(a=RegExp("</"+l[2],"g")),n=R):void 0!==l[3]&&(n=R):n===R?">"===l[0]?(n=a??F,c=-1):void 0===l[1]?c=-2:(c=n.lastIndex-l[2].length,s=l[1],n=void 0===l[3]?R:'"'===l[3]?j:N):n===j||n===N?n=R:n===I||n===L?n=F:(n=R,a=void 0);const p=n===R&&e[t+1].startsWith("/>")?" ":"";r+=n===F?i+T:c>=0?(o.push(s),i.slice(0,c)+A+i.slice(c)+z+p):i+z+(-2===c?t:p)}return[Q(e,r+(e[i]||"<?>")+(2===t?"</svg>":3===t?"</math>":"")),o]};class J{constructor({strings:e,_$litType$:t},i){let o;this.parts=[];let a=0,r=0;const n=e.length-1,s=this.parts,[l,c]=X(e,t);if(this.el=J.createElement(l,i),Z.currentNode=this.el.content,2===t||3===t){const e=this.el.content.firstChild;e.replaceWith(...e.childNodes)}for(;null!==(o=Z.nextNode())&&s.length<n;){if(1===o.nodeType){if(o.hasAttributes())for(const e of o.getAttributeNames())if(e.endsWith(A)){const t=c[r++],i=o.getAttribute(e).split(z),n=/([.?@])?(.*)/.exec(t);s.push({type:1,index:a,name:n[2],strings:i,ctor:"."===n[1]?oe:"?"===n[1]?ae:"@"===n[1]?re:ie}),o.removeAttribute(e)}else e.startsWith(z)&&(s.push({type:6,index:a}),o.removeAttribute(e));if(U.test(o.tagName)){const e=o.textContent.split(z),t=e.length-1;if(t>0){o.textContent=C?C.emptyScript:"";for(let i=0;i<t;i++)o.append(e[i],P()),Z.nextNode(),s.push({type:2,index:++a});o.append(e[t],P())}}}else if(8===o.nodeType)if(o.data===M)s.push({type:2,index:a});else{let e=-1;for(;-1!==(e=o.data.indexOf(z,e+1));)s.push({type:7,index:a}),e+=z.length-1}a++}}static createElement(e,t){const i=O.createElement("template");return i.innerHTML=e,i}}function K(e,t,i=e,o){if(t===G)return t;let a=void 0!==o?i._$Co?.[o]:i._$Cl;const r=B(t)?void 0:t._$litDirective$;return a?.constructor!==r&&(a?._$AO?.(!1),void 0===r?a=void 0:(a=new r(e),a._$AT(e,i,o)),void 0!==o?(i._$Co??=[])[o]=a:i._$Cl=a),void 0!==a&&(t=K(e,a._$AS(e,t.values),a,o)),t}class ee{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){const{el:{content:t},parts:i}=this._$AD,o=(e?.creationScope??O).importNode(t,!0);Z.currentNode=o;let a=Z.nextNode(),r=0,n=0,s=i[0];for(;void 0!==s;){if(r===s.index){let t;2===s.type?t=new te(a,a.nextSibling,this,e):1===s.type?t=new s.ctor(a,s.name,s.strings,this,e):6===s.type&&(t=new ne(a,this,e)),this._$AV.push(t),s=i[++n]}r!==s?.index&&(a=Z.nextNode(),r++)}return Z.currentNode=O,o}p(e){let t=0;for(const i of this._$AV)void 0!==i&&(void 0!==i.strings?(i._$AI(e,i,t),t+=i.strings.length-2):i._$AI(e[t])),t++}}class te{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,i,o){this.type=2,this._$AH=q,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=i,this.options=o,this._$Cv=o?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode;const t=this._$AM;return void 0!==t&&11===e?.nodeType&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=K(this,e,t),B(e)?e===q||null==e||""===e?(this._$AH!==q&&this._$AR(),this._$AH=q):e!==this._$AH&&e!==G&&this._(e):void 0!==e._$litType$?this.$(e):void 0!==e.nodeType?this.T(e):(e=>E(e)||"function"==typeof e?.[Symbol.iterator])(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==q&&B(this._$AH)?this._$AA.nextSibling.data=e:this.T(O.createTextNode(e)),this._$AH=e}$(e){const{values:t,_$litType$:i}=e,o="number"==typeof i?this._$AC(e):(void 0===i.el&&(i.el=J.createElement(Q(i.h,i.h[0]),this.options)),i);if(this._$AH?._$AD===o)this._$AH.p(t);else{const e=new ee(o,this),i=e.u(this.options);e.p(t),this.T(i),this._$AH=e}}_$AC(e){let t=Y.get(e.strings);return void 0===t&&Y.set(e.strings,t=new J(e)),t}k(e){E(this._$AH)||(this._$AH=[],this._$AR());const t=this._$AH;let i,o=0;for(const a of e)o===t.length?t.push(i=new te(this.O(P()),this.O(P()),this,this.options)):i=t[o],i._$AI(a),o++;o<t.length&&(this._$AR(i&&i._$AB.nextSibling,o),t.length=o)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e!==this._$AB;){const t=k(e).nextSibling;k(e).remove(),e=t}}setConnected(e){void 0===this._$AM&&(this._$Cv=e,this._$AP?.(e))}}class ie{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,i,o,a){this.type=1,this._$AH=q,this._$AN=void 0,this.element=e,this.name=t,this._$AM=o,this.options=a,i.length>2||""!==i[0]||""!==i[1]?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=q}_$AI(e,t=this,i,o){const a=this.strings;let r=!1;if(void 0===a)e=K(this,e,t,0),r=!B(e)||e!==this._$AH&&e!==G,r&&(this._$AH=e);else{const o=e;let n,s;for(e=a[0],n=0;n<a.length-1;n++)s=K(this,o[i+n],t,n),s===G&&(s=this._$AH[n]),r||=!B(s)||s!==this._$AH[n],s===q?e=q:e!==q&&(e+=(s??"")+a[n+1]),this._$AH[n]=s}r&&!o&&this.j(e)}j(e){e===q?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}}class oe extends ie{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===q?void 0:e}}class ae extends ie{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==q)}}class re extends ie{constructor(e,t,i,o,a){super(e,t,i,o,a),this.type=5}_$AI(e,t=this){if((e=K(this,e,t,0)??q)===G)return;const i=this._$AH,o=e===q&&i!==q||e.capture!==i.capture||e.once!==i.once||e.passive!==i.passive,a=e!==q&&(i===q||o);o&&this.element.removeEventListener(this.name,this,i),a&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}}class ne{constructor(e,t,i){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(e){K(this,e)}}const se=$.litHtmlPolyfillSupport;se?.(J,te),($.litHtmlVersions??=[]).push("3.3.2");const le=globalThis;let ce=class extends w{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){const t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=((e,t,i)=>{const o=i?.renderBefore??t;let a=o._$litPart$;if(void 0===a){const e=i?.renderBefore??null;o._$litPart$=a=new te(t.insertBefore(P(),e),e,void 0,i??{})}return a._$AI(e),a})(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return G}};ce._$litElement$=!0,ce.finalized=!0,le.litElementHydrateSupport?.({LitElement:ce});const de=le.litElementPolyfillSupport;de?.({LitElement:ce}),(le.litElementVersions??=[]).push("4.2.2");const pe=e=>(t,i)=>{void 0!==i?i.addInitializer(()=>{customElements.define(e,t)}):customElements.define(e,t)},ue={attribute:!0,type:String,converter:x,reflect:!1,hasChanged:y},he=(e=ue,t,i)=>{const{kind:o,metadata:a}=i;let r=globalThis.litPropertyMetadata.get(a);if(void 0===r&&globalThis.litPropertyMetadata.set(a,r=new Map),"setter"===o&&((e=Object.create(e)).wrapped=!0),r.set(i.name,e),"accessor"===o){const{name:o}=i;return{set(i){const a=t.get.call(this);t.set.call(this,i),this.requestUpdate(o,a,e,!0,i)},init(t){return void 0!==t&&this.C(o,void 0,e,t),t}}}if("setter"===o){const{name:o}=i;return function(i){const a=this[o];t.call(this,i),this.requestUpdate(o,a,e,!0,i)}}throw Error("Unsupported decorator location: "+o)};function ge(e){return(t,i)=>"object"==typeof i?he(e,t,i):((e,t,i)=>{const o=t.hasOwnProperty(i);return t.constructor.createProperty(i,e),o?Object.getOwnPropertyDescriptor(t,i):void 0})(e,t,i)}function fe(e){return ge({...e,state:!0,attribute:!1})}const ve=1;let be=class{constructor(e){}get _$AU(){return this._$AM._$AU}_$AT(e,t,i){this._$Ct=e,this._$AM=t,this._$Ci=i}_$AS(e,t){return this.update(e,t)}update(e,t){return this.render(...t)}};const me="important",xe=" !"+me,ye=(e=>(...t)=>({_$litDirective$:e,values:t}))(class extends be{constructor(e){if(super(e),e.type!==ve||"style"!==e.name||e.strings?.length>2)throw Error("The `styleMap` directive must be used in the `style` attribute and must be the only part in the attribute.")}render(e){return Object.keys(e).reduce((t,i)=>{const o=e[i];return null==o?t:t+`${i=i.includes("-")?i:i.replace(/(?:^(webkit|moz|ms|o)|)(?=[A-Z])/g,"-$&").toLowerCase()}:${o};`},"")}update(e,[t]){const{style:i}=e.element;if(void 0===this.ft)return this.ft=new Set(Object.keys(t)),this.render(t);for(const e of this.ft)null==t[e]&&(this.ft.delete(e),e.includes("-")?i.removeProperty(e):i[e]=null);for(const e in t){const o=t[e];if(null!=o){this.ft.add(e);const t="string"==typeof o&&o.endsWith(xe);e.includes("-")||t?i.setProperty(e,t?o.slice(0,-11):o,t?me:""):i[e]=o}}return G}}),_e=new Set(["switch","light","cover","valve","climate","sensor","binary_sensor","fan","lock","media_player","vacuum","alarm_control_panel","humidifier","water_heater","update","button","number","select","text","camera","event"]);function we(e){const t=e.entities??{},i=e.devices??{},o=e.areas??{},a=new Map;for(const[r,n]of Object.entries(t)){if(!n?.device_id)continue;if(n.hidden_by)continue;const t=r.split(".")[0];if(!_e.has(t))continue;const s=(n.platform??"").toLowerCase();if("shelly"!==s)continue;const l=n.device_id;if(!a.has(l)){const e=i[l];if(!e)continue;const t=(e.configuration_url??"").match(/https?:\/\/((?:\d{1,3}\.){3}\d{1,3})/),r=(e.manufacturer??"").toLowerCase().includes("shelly")||"shelly"===s,c=e.area_id??n.area_id,d=c?o[c]?.name:void 0;a.set(l,{device_id:l,name:e.name_by_user??e.name??l,area:d,model:e.model,sw_version:e.sw_version,ip:t?t[1]:void 0,isShelly:r,integration:s,entities:[]})}const c=a.get(l);c.isShelly||"shelly"!==s||(c.isShelly=!0,c.integration="shelly");const d=e.states[r];c.entities.push({entity_id:r,domain:t,state:d?.state??"unavailable",attributes:d?.attributes??{},device_id:l,area_id:n.area_id,platform:s})}const r=new Set;for(const[e,t]of a){if(r.has(e))continue;const o=i[e],n=o?.via_device_id;if(!n||!a.has(n)||r.has(n))continue;const s=i[n],l=o?.configuration_url??"",c=s?.configuration_url??"",d=e=>{const t=e.match(/https?:\/\/([^/]+)/);return t?t[1]:""},p=l&&c&&d(l)===d(c),u=!l&&c&&t.integration===a.get(n).integration;if(!p&&!u)continue;const h=a.get(n);h.entities.push(...t.entities),!h.ip&&t.ip&&(h.ip=t.ip),!h.model&&t.model&&(h.model=t.model),r.add(e)}for(const e of r)a.delete(e);return Array.from(a.values()).filter(e=>e.entities.length>0).sort((e,t)=>e.name.localeCompare(t.name))}const $e={relay:"Relay",plug:"Plug",dimmer:"Dimmer",rgb:"RGB",climate:"TRV",cover:"Roller",valve:"Valve",energy:"Energy",sensor:"Sensor",input:"Input",uni:"UNI",wall_display:"Display",generic:""},ke={relay:["name_row","relay_channels","sensors","graph","power_bar","virtual_controls","badges"],plug:["name_row","sensors","graph","power_bar","virtual_controls","badges"],dimmer:["name_row","dimmer","sensors","graph","virtual_controls","badges"],rgb:["name_row","dimmer","sensors","graph","virtual_controls","badges"],climate:["name_row","sensors","trv_control","virtual_controls","badges"],cover:["name_row","cover_controls","sensors","virtual_controls","badges"],valve:["name_row","sensors","valve_controls","virtual_controls","badges"],energy:["name_row","sensors","graph","virtual_controls","badges"],sensor:["name_row","sensors","graph","virtual_controls","badges"],input:["name_row","sensors","input_channels","virtual_controls","badges"],uni:["name_row","input_channels","sensors","virtual_controls","badges"],wall_display:["name_row","sensors","trv_control","virtual_controls","badges"],generic:["name_row","sensors","virtual_controls","badges"]};const Ce={shelly:"Shelly",zha:"ZHA",mqtt:"MQTT",z2m:"Z2M",zigbee2mqtt:"Z2M",hue:"Hue",deconz:"deCONZ",matter:"Matter",homekit:"HomeKit",tuya:"Tuya",tplink:"Kasa",esphome:"ESPHome",wled:"WLED",tasmota:"Tasmota",konnected:"Konnected",nest:"Nest",ring:"Ring",lifx:"LIFX",nanoleaf:"Nanoleaf",sonos:"Sonos"};function Se(e){return e>=1e3?`${(e/1e3).toFixed(2)} kW`:`${e.toFixed(1)} W`}function Ae(e){return`${e.toFixed(3)} kWh`}function ze(e){return`${e.toFixed(1)} V`}function Me(e){return`${e.toFixed(3)} A`}function Te(e){return`${e.toFixed(1)} °C`}function Oe(e){return e<60?`${e}s`:e<3600?`${Math.floor(e/60)}m`:e<86400?`${Math.floor(e/3600)}h ${Math.floor(e%3600/60)}m`:`${Math.floor(e/86400)}d ${Math.floor(e%86400/3600)}h`}function Pe(e){return e>=-50?"Excellent":e>=-60?"Good":e>=-70?"Fair":"Poor"}function Be(e){return`${e.toFixed(1)} VA`}function Ee(e){return`${e.toFixed(1)} VAr`}function De(e){return`${e.toFixed(2)} Hz`}function Fe(e){return`${e.toFixed(1)} %`}function Ie(e){return e>=1e4?`${(e/1e3).toFixed(1)} klx`:`${Math.round(e)} lx`}function Le(e){return`${Math.round(e)} ppm`}function Re(e){return`${Math.round(e)} %`}const Ne=[{key:"power",label:"Power",unit:"W",group:"Electrical",defaultColor:"#f4601e"},{key:"voltage",label:"Voltage",unit:"V",group:"Electrical",defaultColor:"#a78bfa"},{key:"current",label:"Current",unit:"A",group:"Electrical",defaultColor:"#fbbf24"},{key:"energy",label:"Energy",unit:"kWh",group:"Electrical",defaultColor:"#4ade80"},{key:"apparent_power",label:"App. Power",unit:"VA",group:"Electrical",defaultColor:"#f472b6"},{key:"reactive_power",label:"React. Power",unit:"VAr",group:"Electrical",defaultColor:"#818cf8"},{key:"frequency",label:"Frequency",unit:"Hz",group:"Electrical",defaultColor:"#34d399"},{key:"power_factor",label:"Power Factor",unit:"%",group:"Electrical",defaultColor:"#fb923c"},{key:"temperature",label:"Temperature",unit:"°C",group:"Environmental",defaultColor:"#4fc3f7"},{key:"humidity",label:"Humidity",unit:"%",group:"Environmental",defaultColor:"#2dd4bf"},{key:"illuminance",label:"Illuminance",unit:"lx",group:"Environmental",defaultColor:"#fde047"},{key:"carbon_dioxide",label:"CO₂",unit:"ppm",group:"Environmental",defaultColor:"#a3e635"},{key:"gas",label:"Gas",unit:"%",group:"Environmental",defaultColor:"#fb923c"},{key:"battery",label:"Battery",unit:"%",group:"Device",defaultColor:"#86efac"},{key:"signal_strength",label:"RSSI",unit:"dBm",group:"Device",defaultColor:"#7dd3fc"}],je=Object.fromEntries(Ne.map(e=>[e.key,e.label.split(" ")[0]]));function Ue(e,t,i,o){if("none"===e)return V``;const a=t?"on":"off";return"flame"===e?V`${W`<svg class="${o} ent-icon-flame ${a}" style="${i}" viewBox="0 0 20 20">
    <path class="flame-main" d="M10 17 C6 17 4 14 4 11 C4 8 6 6 8 4 C8 7 9 8 10 8 C11 8 11 7 11 6 C13 8 16 10 16 13 C16 16 13.5 17 10 17Z" fill="currentColor"/>
    <path class="flame-inner" d="M10 15.5 C8 15.5 7 14 7.5 12 C8 13 9 13.5 10 13.5 C11 13.5 12 13 12 12 C12.5 14 12 15.5 10 15.5Z" fill="rgba(255,220,80,0.8)"/>
  </svg>`}`:"snowflake"===e?V`${W`<svg class="${o} ent-icon-snowflake" style="${i}" viewBox="0 0 20 20">
    <g class="snow-arms" style="transform-origin:10px 10px">
      <line x1="10" y1="2.5" x2="10" y2="17.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="2.5" y1="10" x2="17.5" y2="10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="4.5" y1="4.5" x2="15.5" y2="15.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="15.5" y1="4.5" x2="4.5" y2="15.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      <circle cx="10" cy="10" r="1.5" fill="currentColor"/>
    </g>
  </svg>`}`:"fan"===e?V`${W`<svg class="${o} ent-icon-fan ${a}" style="${i}" viewBox="0 0 20 20">
    <g class="fan-blades" style="transform-origin:10px 10px">
      <ellipse cx="10" cy="6" rx="2" ry="4" fill="currentColor" opacity="0.8"/>
      <ellipse cx="10" cy="6" rx="2" ry="4" fill="currentColor" opacity="0.8" transform="rotate(120 10 10)"/>
      <ellipse cx="10" cy="6" rx="2" ry="4" fill="currentColor" opacity="0.8" transform="rotate(240 10 10)"/>
    </g>
    <circle cx="10" cy="10" r="1.5" fill="currentColor"/>
  </svg>`}`:"pulse"===e?V`${W`<svg class="${o} ent-icon-pulse ${a}" style="${i}" viewBox="0 0 20 20">
    <circle class="pulse-ring" cx="10" cy="10" r="7" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.3"/>
    <circle cx="10" cy="10" r="2.5" fill="currentColor"/>
  </svg>`}`:"wave"===e?V`${W`<svg class="${o} ent-icon-wave" style="${i}" viewBox="0 0 20 20">
    <polyline class="energy-wave" points="2,10 5,5 8,15 11,5 14,15 18,10" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`}`:"sun"===e?V`${W`<svg class="${o} ent-icon-sun ${a}" style="${i}" viewBox="0 0 20 20">
    <g class="sun-group" style="transform-origin:10px 10px">
      <circle cx="10" cy="10" r="3.5" fill="currentColor"/>
      <line x1="10" y1="2" x2="10" y2="4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="10" y1="16" x2="10" y2="18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="2" y1="10" x2="4" y2="10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="16" y1="10" x2="18" y2="10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="4.3" y1="4.3" x2="5.7" y2="5.7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="14.3" y1="14.3" x2="15.7" y2="15.7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="15.7" y1="4.3" x2="14.3" y2="5.7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="5.7" y1="14.3" x2="4.3" y2="15.7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    </g>
  </svg>`}`:"lightning"===e?V`${W`<svg class="${o} ent-icon-lightning ${a}" style="${i}" viewBox="0 0 20 20">
    <path d="M11.5 2 L5 11 L9.5 11 L8.5 18 L15 9 L10.5 9 Z" fill="currentColor"/>
  </svg>`}`:"heart"===e?V`${W`<svg class="${o} ent-icon-heart ${a}" style="${i}" viewBox="0 0 20 20">
    <path class="heart-shape" d="M10 16 C10 16 3 11 3 7 C3 4.5 5 3 7 3 C8.5 3 9.5 4 10 5 C10.5 4 11.5 3 13 3 C15 3 17 4.5 17 7 C17 11 10 16 10 16Z" fill="currentColor"/>
  </svg>`}`:"bulb"===e?V`${W`<svg class="${o} ent-icon-bulb ${a}" style="${i}" viewBox="0 0 20 20">
    <path class="bulb-body" d="M10 3 C7 3 5 5.5 5 8 C5 10.2 6.5 11.8 7 13 L13 13 C13.5 11.8 15 10.2 15 8 C15 5.5 13 3 10 3Z" fill="currentColor" opacity="0.9"/>
    <rect class="bulb-base1" x="7.5" y="13.5" width="5" height="1.5" rx="0.5" fill="currentColor" opacity="0.65"/>
    <rect class="bulb-base2" x="8.2" y="15.5" width="3.6" height="1" rx="0.5" fill="currentColor" opacity="0.4"/>
  </svg>`}`:"leaf"===e?V`${W`<svg class="${o} ent-icon-leaf ${a}" style="${i}" viewBox="0 0 20 20">
    <path class="leaf-body" d="M10 17 C10 17 4 13 4 8 C4 5 7 3 10 3 C13 3 16 5 16 8 C16 13 10 17 10 17Z" fill="currentColor"/>
    <line x1="10" y1="17" x2="10" y2="9" stroke="rgba(0,0,0,0.25)" stroke-width="1" stroke-linecap="round"/>
  </svg>`}`:"moon"===e?V`${W`<svg class="${o} ent-icon-moon ${a}" style="${i}" viewBox="0 0 20 20">
    <path d="M14 4 C10.7 4 8 6.7 8 10 C8 13.3 10.7 16 14 16 C11.4 16 9.4 13.3 9.4 10 C9.4 6.7 11.4 4 14 4Z" fill="currentColor"/>
  </svg>`}`:"water"===e?V`${W`<svg class="${o} ent-icon-water ${a}" style="${i}" viewBox="0 0 20 20">
    <path class="drop-body" d="M10 3 C10 3 5 9 5 13 C5 16 7.2 18 10 18 C12.8 18 15 16 15 13 C15 9 10 3 10 3Z" fill="currentColor"/>
  </svg>`}`:"lock"===e?V`${W`<svg class="${o} ent-icon-lock ${a}" style="${i}" viewBox="0 0 20 20">
    <rect x="5" y="9" width="10" height="8" rx="2" fill="currentColor" opacity="0.9"/>
    <path d="M7 9 L7 6.5 C7 4.3 13 4.3 13 6.5 L13 9" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
    <circle cx="10" cy="13.5" r="1.5" fill="rgba(0,0,0,0.35)"/>
  </svg>`}`:"flame2"===e?V`${W`<svg class="${o} ent-icon-flame2 ${a}" style="${i}" viewBox="0 0 20 20">
    <path class="flame-main" d="M7 17 C4.5 17 3 15 3 12.5 C3 10 4.5 8.5 5.5 6.5 C5.5 9 6.5 10 7.5 10 C8 8.5 8 7.5 8 6 C9.5 7.5 11 9.5 11 12.5 C11 15 9.5 17 7 17Z" fill="currentColor"/>
    <path class="flame-b" d="M13 17 C10.5 17 9 15 9 12.5 C9 10 10.5 8.5 11.5 6.5 C11.5 9 12.5 10 13.5 10 C14 8.5 14 7.5 14 6 C15.5 7.5 17 9.5 17 12.5 C17 15 15.5 17 13 17Z" fill="currentColor" opacity="0.72"/>
  </svg>`}`:"flame3"===e?V`${W`<svg class="${o} ent-icon-flame3 ${a}" style="${i}" viewBox="0 0 20 20">
    <ellipse cx="10" cy="17" rx="6" ry="1.5" fill="currentColor" opacity="0.45"/>
    <line x1="6.5" y1="17" x2="9" y2="13.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" opacity="0.55"/>
    <line x1="13.5" y1="17" x2="11" y2="13.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" opacity="0.55"/>
    <path class="flame-main" d="M10 14.5 C8 14.5 6.5 12.5 6.5 10.5 C6.5 9 7.5 7.5 9 6 C9 8 9.5 9 10 9 C10.5 9 11 8 11 6 C12.5 7.5 13.5 9 13.5 10.5 C13.5 12.5 12 14.5 10 14.5Z" fill="currentColor"/>
  </svg>`}`:"snowflake2"===e?V`${W`<svg class="${o} ent-icon-snowflake2" style="${i}" viewBox="0 0 20 20">
    <g class="snow-arms" style="transform-origin:10px 10px">
      <line x1="10" y1="2" x2="10" y2="18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="10" y1="2" x2="10" y2="18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" transform="rotate(60 10 10)"/>
      <line x1="10" y1="2" x2="10" y2="18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" transform="rotate(120 10 10)"/>
      <line x1="7.8" y1="5.8" x2="12.2" y2="5.8" stroke="currentColor" stroke-width="1" stroke-linecap="round"/>
      <line x1="7.8" y1="5.8" x2="12.2" y2="5.8" stroke="currentColor" stroke-width="1" stroke-linecap="round" transform="rotate(60 10 10)"/>
      <line x1="7.8" y1="5.8" x2="12.2" y2="5.8" stroke="currentColor" stroke-width="1" stroke-linecap="round" transform="rotate(120 10 10)"/>
      <line x1="7.8" y1="14.2" x2="12.2" y2="14.2" stroke="currentColor" stroke-width="1" stroke-linecap="round"/>
      <line x1="7.8" y1="14.2" x2="12.2" y2="14.2" stroke="currentColor" stroke-width="1" stroke-linecap="round" transform="rotate(60 10 10)"/>
      <line x1="7.8" y1="14.2" x2="12.2" y2="14.2" stroke="currentColor" stroke-width="1" stroke-linecap="round" transform="rotate(120 10 10)"/>
      <circle cx="10" cy="10" r="1.5" fill="currentColor"/>
    </g>
  </svg>`}`:"snowflake3"===e?V`${W`<svg class="${o} ent-icon-snowflake3" style="${i}" viewBox="0 0 20 20">
    <g class="snow-drift-g" style="transform-origin:10px 10px">
      <line x1="10" y1="2.5" x2="10" y2="17.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="2.5" y1="10" x2="17.5" y2="10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="4.5" y1="4.5" x2="15.5" y2="15.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="15.5" y1="4.5" x2="4.5" y2="15.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      <circle cx="10" cy="10" r="1.5" fill="currentColor"/>
    </g>
  </svg>`}`:"fan2"===e?V`${W`<svg class="${o} ent-icon-fan2 ${a}" style="${i}" viewBox="0 0 20 20">
    <g class="fan-blades" style="transform-origin:10px 10px">
      <ellipse cx="10" cy="6" rx="1.8" ry="4" fill="currentColor" opacity="0.85"/>
      <ellipse cx="10" cy="6" rx="1.8" ry="4" fill="currentColor" opacity="0.85" transform="rotate(90 10 10)"/>
      <ellipse cx="10" cy="6" rx="1.8" ry="4" fill="currentColor" opacity="0.85" transform="rotate(180 10 10)"/>
      <ellipse cx="10" cy="6" rx="1.8" ry="4" fill="currentColor" opacity="0.85" transform="rotate(270 10 10)"/>
    </g>
    <circle cx="10" cy="10" r="1.5" fill="currentColor"/>
  </svg>`}`:"fan3"===e?V`${W`<svg class="${o} ent-icon-fan3 ${a}" style="${i}" viewBox="0 0 20 20">
    <g class="fan-blades" style="transform-origin:10px 10px">
      <path d="M10 5 C14 5.5 15.5 9.5 13.5 13" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" opacity="0.9"/>
      <path d="M10 5 C14 5.5 15.5 9.5 13.5 13" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" opacity="0.9" transform="rotate(120 10 10)"/>
      <path d="M10 5 C14 5.5 15.5 9.5 13.5 13" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" opacity="0.9" transform="rotate(240 10 10)"/>
    </g>
    <circle cx="10" cy="10" r="2" fill="currentColor"/>
  </svg>`}`:"lightning2"===e?V`${W`<svg class="${o} ent-icon-lightning2 ${a}" style="${i}" viewBox="0 0 20 20">
    <path class="bolt-a" d="M8 2 L4 9.5 L7.5 9.5 L6.5 17 L11 9.5 L7.5 9.5Z" fill="currentColor"/>
    <path class="bolt-b" d="M13.5 2 L9.5 9.5 L13 9.5 L12 17 L16.5 9.5 L13 9.5Z" fill="currentColor" opacity="0.65"/>
  </svg>`}`:"lightning3"===e?V`${W`<svg class="${o} ent-icon-lightning3 ${a}" style="${i}" viewBox="0 0 20 20">
    <path class="arc-path" d="M3 4 Q10 1 17 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    <circle cx="3" cy="4" r="1.5" fill="currentColor"/>
    <circle cx="17" cy="16" r="1.5" fill="currentColor"/>
  </svg>`}`:"bulb2"===e?V`${W`<svg class="${o} ent-icon-bulb2 ${a}" style="${i}" viewBox="0 0 20 20">
    <path class="bulb-body" d="M10 3 C7.5 3 6 5.2 6 7.5 C6 9.5 7 11.2 7.5 12.5 L12.5 12.5 C13 11.2 14 9.5 14 7.5 C14 5.2 12.5 3 10 3Z" fill="currentColor" opacity="0.85"/>
    <path class="bulb-filament" d="M8.5 9.5 Q9.5 8 10 9 Q10.5 10 11.5 8.5" fill="none" stroke="rgba(255,210,70,0.95)" stroke-width="0.9" stroke-linecap="round"/>
    <rect class="bulb-base1" x="7.8" y="13" width="4.4" height="1.5" rx="0.5" fill="currentColor" opacity="0.6"/>
    <rect class="bulb-base2" x="8.3" y="15" width="3.4" height="1" rx="0.5" fill="currentColor" opacity="0.4"/>
  </svg>`}`:"bulb3"===e?V`${W`<svg class="${o} ent-icon-bulb3 ${a}" style="${i}" viewBox="0 0 20 20">
    <polygon points="10,3 14.3,5.5 14.3,10.5 10,13 5.7,10.5 5.7,5.5" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <circle class="bulb-chip" cx="10" cy="8" r="2" fill="currentColor" opacity="0.9"/>
    <line x1="10" y1="13" x2="10" y2="17" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    <line x1="8" y1="15" x2="12" y2="15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
  </svg>`}`:"water2"===e?V`${W`<svg class="${o} ent-icon-water2" style="${i}" viewBox="0 0 20 20">
    <polyline class="wave-a" points="1,8 4,5 7,11 10,5 13,11 16,5 19,8" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="48"/>
    <polyline class="wave-b" points="1,13 4,10 7,16 10,10 13,16 16,10 19,13" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="48" opacity="0.5"/>
  </svg>`}`:"water3"===e?V`${W`<svg class="${o} ent-icon-water3 ${a}" style="${i}" viewBox="0 0 20 20">
    <circle cx="10" cy="10" r="2" fill="currentColor"/>
    <circle class="ripple1" cx="10" cy="10" r="2" fill="none" stroke="currentColor" stroke-width="1.2"/>
    <circle class="ripple2" cx="10" cy="10" r="2" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.6"/>
  </svg>`}`:"sun2"===e?V`${W`<svg class="${o} ent-icon-sun2 ${a}" style="${i}" viewBox="0 0 20 20">
    <path d="M3.5 13 A6.5 6.5 0 0 1 16.5 13 Z" fill="currentColor"/>
    <line x1="10" y1="2" x2="10" y2="5.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    <line x1="4.5" y1="4.5" x2="6.8" y2="6.8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    <line x1="15.5" y1="4.5" x2="13.2" y2="6.8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    <line x1="1.5" y1="10" x2="4.5" y2="10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    <line x1="18.5" y1="10" x2="15.5" y2="10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    <line x1="3.5" y1="13" x2="16.5" y2="13" stroke="currentColor" stroke-width="1" stroke-linecap="round" opacity="0.35"/>
  </svg>`}`:"sun3"===e?V`${W`<svg class="${o} ent-icon-sun3 ${a}" style="${i}" viewBox="0 0 20 20">
    <g class="sun-group" style="transform-origin:10px 10px">
      <circle cx="10" cy="10" r="3" fill="currentColor"/>
      <line x1="10" y1="2.5" x2="10" y2="5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="10" y1="2.5" x2="10" y2="5" stroke="currentColor" stroke-width="1" stroke-linecap="round" transform="rotate(30 10 10)"/>
      <line x1="10" y1="2.5" x2="10" y2="5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" transform="rotate(60 10 10)"/>
      <line x1="10" y1="2.5" x2="10" y2="5" stroke="currentColor" stroke-width="1" stroke-linecap="round" transform="rotate(90 10 10)"/>
      <line x1="10" y1="2.5" x2="10" y2="5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" transform="rotate(120 10 10)"/>
      <line x1="10" y1="2.5" x2="10" y2="5" stroke="currentColor" stroke-width="1" stroke-linecap="round" transform="rotate(150 10 10)"/>
      <line x1="10" y1="2.5" x2="10" y2="5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" transform="rotate(180 10 10)"/>
      <line x1="10" y1="2.5" x2="10" y2="5" stroke="currentColor" stroke-width="1" stroke-linecap="round" transform="rotate(210 10 10)"/>
      <line x1="10" y1="2.5" x2="10" y2="5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" transform="rotate(240 10 10)"/>
      <line x1="10" y1="2.5" x2="10" y2="5" stroke="currentColor" stroke-width="1" stroke-linecap="round" transform="rotate(270 10 10)"/>
      <line x1="10" y1="2.5" x2="10" y2="5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" transform="rotate(300 10 10)"/>
      <line x1="10" y1="2.5" x2="10" y2="5" stroke="currentColor" stroke-width="1" stroke-linecap="round" transform="rotate(330 10 10)"/>
    </g>
  </svg>`}`:"moon2"===e?V`${W`<svg class="${o} ent-icon-moon2 ${a}" style="${i}" viewBox="0 0 20 20">
    <circle cx="10" cy="10" r="7" fill="currentColor" opacity="0.9"/>
    <circle cx="7.5" cy="8" r="1.5" fill="rgba(0,0,0,0.14)"/>
    <circle cx="12.5" cy="12" r="1" fill="rgba(0,0,0,0.11)"/>
    <circle cx="8" cy="13" r="0.7" fill="rgba(0,0,0,0.1)"/>
  </svg>`}`:"moon3"===e?V`${W`<svg class="${o} ent-icon-moon3 ${a}" style="${i}" viewBox="0 0 20 20">
    <path d="M14 4 C10.7 4 8 6.7 8 10 C8 13.3 10.7 16 14 16 C11.4 16 9.4 13.3 9.4 10 C9.4 6.7 11.4 4 14 4Z" fill="currentColor"/>
    <circle class="star1" cx="3.5" cy="5" r="0.9" fill="currentColor"/>
    <circle class="star2" cx="2" cy="12" r="0.7" fill="currentColor"/>
    <circle class="star3" cx="5.5" cy="16.5" r="0.7" fill="currentColor"/>
  </svg>`}`:"wind"===e?V`${W`<svg class="${o} ent-icon-wind ${a}" style="${i}" viewBox="0 0 20 20">
    <polyline class="wind-line-a" points="2,6 5,5 8,7 11,5 14,7 18,6" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="24" opacity="1"/>
    <polyline class="wind-line-b" points="2,10 5,9 8,11 11,9 14,11 18,10" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="20" opacity="0.65"/>
    <polyline class="wind-line-c" points="2,14 5,13 8,15 11,13 16,15" fill="none" stroke="currentColor" stroke-width="0.9" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="16" opacity="0.35"/>
  </svg>`}`:"wind2"===e?V`${W`<svg class="${o} ent-icon-wind2 ${a}" style="${i}" viewBox="0 0 20 20">
    <polyline class="gust-a" points="3,6 6,10 3,14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <polyline class="gust-b" points="8,6 11,10 8,14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" opacity="0.7"/>
    <polyline class="gust-c" points="13,6 16,10 13,14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" opacity="0.4"/>
  </svg>`}`:"wind3"===e?V`${W`<svg class="${o} ent-icon-wind3 ${a}" style="${i}" viewBox="0 0 20 20">
    <path class="spiral-path" d="M10 10 C14 8 16 5 13 3 C10 1 7 4 8 7 C9 10 13 12 15 11 C18 9 17 5 14 4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
    <circle cx="8" cy="7" r="1" fill="currentColor" opacity="0.5"/>
  </svg>`}`:"bell"===e?V`${W`<svg class="${o} ent-icon-bell ${a}" style="${i}" viewBox="0 0 20 20">
    <path d="M10 3 C10 3 7 5 7 9 L7 13 L4 14 L4 15 L16 15 L16 14 L13 13 L13 9 C13 5 10 3 10 3Z" fill="currentColor"/>
    <path d="M8.5 15.5 C8.5 16.5 9 17.5 10 17.5 C11 17.5 11.5 16.5 11.5 15.5" fill="none" stroke="currentColor" stroke-width="1.2"/>
    <circle cx="10" cy="2.5" r="1.2" fill="currentColor" opacity="0.6"/>
  </svg>`}`:"bell2"===e?V`${W`<svg class="${o} ent-icon-bell2 ${a}" style="${i}" viewBox="0 0 20 20">
    <path d="M7 4 C7 4 5 6 5 9 L5 13 L3 14 L3 15 L13 15 L13 14 L11 13 L11 9 C11 6 9 4 7 4Z" fill="currentColor" opacity="0.9"/>
    <path d="M6.5 15.5 C6.5 16.3 7 17 8 17 C9 17 9.5 16.3 9.5 15.5" fill="none" stroke="currentColor" stroke-width="1.1"/>
    <path class="ring-a" d="M13 7 Q15 9 13 11" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
    <path class="ring-b" d="M14.5 5.5 Q17.5 9 14.5 12.5" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" opacity="0.6"/>
    <path class="ring-c" d="M16 4 Q20 9 16 14" fill="none" stroke="currentColor" stroke-width="0.8" stroke-linecap="round" opacity="0.3"/>
  </svg>`}`:"bell3"===e?V`${W`<svg class="${o} ent-icon-bell3 ${a}" style="${i}" viewBox="0 0 20 20">
    <polygon points="10,2 18,16 2,16" fill="currentColor" opacity="0.85"/>
    <rect x="9.3" y="7" width="1.4" height="5" rx="0.7" fill="rgba(0,0,0,0.45)"/>
    <circle cx="10" cy="14" r="1" fill="rgba(0,0,0,0.45)"/>
  </svg>`}`:"thermometer"===e?V`${W`<svg class="${o} ent-icon-thermometer ${a}" style="${i}" viewBox="0 0 20 20">
    <rect x="8.5" y="3" width="3" height="10" rx="1.5" fill="currentColor" opacity="0.3"/>
    <rect class="therm-mercury" x="9" y="7" width="2" height="6" rx="1" fill="currentColor"/>
    <circle cx="10" cy="15" r="3" fill="currentColor"/>
    <circle cx="10" cy="15" r="1.5" fill="rgba(255,255,255,0.25)"/>
  </svg>`}`:"thermometer2"===e?V`${W`<svg class="${o} ent-icon-thermometer2 ${a}" style="${i}" viewBox="0 0 20 20">
    <rect x="7" y="3" width="3" height="10" rx="1.5" fill="currentColor" opacity="0.3"/>
    <rect x="7.5" y="5" width="2" height="8" rx="1" fill="currentColor"/>
    <circle cx="8.5" cy="15" r="2.5" fill="currentColor"/>
    <polyline class="therm-arrow" points="14,12 14,5 12,7" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    <line x1="14" y1="5" x2="16" y2="7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
  </svg>`}`:"thermometer3"===e?V`${W`<svg class="${o} ent-icon-thermometer3 ${a}" style="${i}" viewBox="0 0 20 20">
    <rect x="8" y="3" width="3" height="10" rx="1.5" fill="currentColor" opacity="0.3"/>
    <rect x="8.5" y="6" width="2" height="7" rx="1" fill="currentColor"/>
    <circle cx="9.5" cy="15" r="2.5" fill="currentColor"/>
    <polyline class="therm-up" points="14.5,11 14.5,6 13,8" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" opacity="0.9"/>
    <line x1="14.5" y1="6" x2="16" y2="8" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" opacity="0.9"/>
    <polyline class="therm-down" points="17.5,9 17.5,14 16,12" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" opacity="0.5"/>
    <line x1="17.5" y1="14" x2="19" y2="12" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" opacity="0.5"/>
  </svg>`}`:"battery"===e?V`${W`<svg class="${o} ent-icon-battery ${a}" style="${i}" viewBox="0 0 20 20">
    <rect x="2" y="6.5" width="14" height="7" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <rect x="16" y="9" width="2" height="2" rx="0.5" fill="currentColor"/>
    <rect x="3.5" y="8" width="9" height="4" rx="0.8" fill="currentColor" opacity="0.9"/>
  </svg>`}`:"battery2"===e?V`${W`<svg class="${o} ent-icon-battery2 ${a}" style="${i}" viewBox="0 0 20 20">
    <rect x="2" y="6.5" width="14" height="7" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <rect x="16" y="9" width="2" height="2" rx="0.5" fill="currentColor"/>
    <rect x="3.5" y="8" width="4" height="4" rx="0.8" fill="currentColor" opacity="0.5"/>
    <path class="charge-bolt" d="M10 7.5 L8 10.5 L10 10.5 L8.5 13.5 L12 9.5 L10 9.5 Z" fill="currentColor" opacity="0.9"/>
  </svg>`}`:"battery3"===e?V`${W`<svg class="${o} ent-icon-battery3 ${a}" style="${i}" viewBox="0 0 20 20">
    <rect x="2" y="6.5" width="14" height="7" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <rect x="16" y="9" width="2" height="2" rx="0.5" fill="currentColor"/>
    <rect x="3.5" y="8" width="2" height="4" rx="0.8" fill="currentColor"/>
  </svg>`}`:"star"===e?V`${W`<svg class="${o} ent-icon-star ${a}" style="${i}" viewBox="0 0 20 20">
    <polygon points="10,2 12.2,7.6 18.1,7.6 13.5,11.4 15.3,17.1 10,13.6 4.7,17.1 6.5,11.4 1.9,7.6 7.8,7.6" fill="currentColor"/>
  </svg>`}`:"star2"===e?V`${W`<svg class="${o} ent-icon-star2 ${a}" style="${i}" viewBox="0 0 20 20">
    <g class="star-body" style="transform-origin:10px 10px">
      <ellipse cx="10" cy="10" rx="1.5" ry="8" fill="currentColor"/>
      <ellipse cx="10" cy="10" rx="8" ry="1.5" fill="currentColor"/>
      <ellipse cx="10" cy="10" rx="1.5" ry="8" fill="currentColor" transform="rotate(45 10 10)" opacity="0.6"/>
      <ellipse cx="10" cy="10" rx="8" ry="1.5" fill="currentColor" transform="rotate(45 10 10)" opacity="0.6"/>
    </g>
  </svg>`}`:"star3"===e?V`${W`<svg class="${o} ent-icon-star3 ${a}" style="${i}" viewBox="0 0 20 20">
    <circle cx="5" cy="5" r="2" fill="currentColor"/>
    <line class="star-tail" x1="5" y1="5" x2="15" y2="15" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" opacity="0.55"/>
    <line x1="5" y1="5" x2="12" y2="12" stroke="currentColor" stroke-width="0.7" stroke-linecap="round" opacity="0.3"/>
  </svg>`}`:"pulse2"===e?V`${W`<svg class="${o} ent-icon-pulse2 ${a}" style="${i}" viewBox="0 0 20 20">
    <circle class="pulse-ring" cx="10" cy="10" r="7" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.3"/>
    <circle class="pulse-ring2" cx="10" cy="10" r="7" fill="none" stroke="currentColor" stroke-width="1" opacity="0.2"/>
    <circle cx="10" cy="10" r="2.5" fill="currentColor"/>
  </svg>`}`:"pulse3"===e?V`${W`<svg class="${o} ent-icon-pulse3 ${a}" style="${i}" viewBox="0 0 20 20">
    <polyline class="ekg-line" points="1,10 4,10 5.5,4 7,13 8.5,8 10,10 18,10" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="50" stroke-dashoffset="0"/>
  </svg>`}`:"wave2"===e?V`${W`<svg class="${o} ent-icon-wave2 ${a}" style="${i}" viewBox="0 0 20 20">
    <rect class="bar-odd"  x="2"  y="8"  width="2" height="8"  rx="1" fill="currentColor" style="transform-origin:3px 16px"/>
    <rect class="bar-even" x="5.5" y="5" width="2" height="11" rx="1" fill="currentColor" style="transform-origin:6.5px 16px"/>
    <rect class="bar-odd"  x="9"  y="7"  width="2" height="9"  rx="1" fill="currentColor" style="transform-origin:10px 16px"/>
    <rect class="bar-even" x="12.5" y="4" width="2" height="12" rx="1" fill="currentColor" style="transform-origin:13.5px 16px"/>
    <rect class="bar-odd"  x="16" y="9"  width="2" height="7"  rx="1" fill="currentColor" style="transform-origin:17px 16px"/>
  </svg>`}`:"wave3"===e?V`${W`<svg class="${o} ent-icon-wave3 ${a}" style="${i}" viewBox="0 0 20 20">
    <circle cx="10" cy="10" r="2" fill="currentColor"/>
    <path class="arc-a" d="M6.5 6.5 A5 5 0 0 1 13.5 6.5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" opacity="0.7"/>
    <path class="arc-a" d="M6.5 6.5 A5 5 0 0 0 13.5 6.5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" opacity="0.7"/>
    <path class="arc-b" d="M4 4 A8.5 8.5 0 0 1 16 4" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" opacity="0.45"/>
    <path class="arc-b" d="M4 4 A8.5 8.5 0 0 0 16 4" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" opacity="0.45"/>
    <path class="arc-c" d="M1.5 1.5 A12 12 0 0 1 18.5 1.5" fill="none" stroke="currentColor" stroke-width="0.9" stroke-linecap="round" opacity="0.2"/>
    <path class="arc-c" d="M1.5 1.5 A12 12 0 0 0 18.5 1.5" fill="none" stroke="currentColor" stroke-width="0.9" stroke-linecap="round" opacity="0.2"/>
  </svg>`}`:"wave4"===e?V`${W`<svg class="${o} ent-icon-wave4 ${a}" style="${i}" viewBox="0 0 20 20">
    <circle cx="10" cy="16" r="1.5" fill="currentColor"/>
    <path class="wifi-a" d="M6.5 13 A5 5 0 0 1 13.5 13" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    <path class="wifi-b" d="M3.5 10 A9 9 0 0 1 16.5 10" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" opacity="0.6"/>
    <path class="wifi-c" d="M1 7 A13 13 0 0 1 19 7" fill="none" stroke="currentColor" stroke-width="1.1" stroke-linecap="round" opacity="0.3"/>
  </svg>`}`:"heart2"===e?V`${W`<svg class="${o} ent-icon-heart2 ${a}" style="${i}" viewBox="0 0 20 20">
    <path class="heart-shape" d="M10 16 C10 16 3 11 3 7 C3 4.5 5 3 7 3 C8.5 3 9.5 4 10 5 C10.5 4 11.5 3 13 3 C15 3 17 4.5 17 7 C17 11 10 16 10 16Z" fill="none" stroke="currentColor" stroke-width="1.5"/>
  </svg>`}`:"leaf2"===e?V`${W`<svg class="${o} ent-icon-leaf2 ${a}" style="${i}" viewBox="0 0 20 20">
    <line x1="10" y1="18" x2="10" y2="8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    <ellipse cx="7.5" cy="11" rx="3" ry="1.8" fill="currentColor" opacity="0.9" transform="rotate(-30 7.5 11)"/>
    <ellipse cx="12.5" cy="9" rx="3" ry="1.8" fill="currentColor" opacity="0.7" transform="rotate(30 12.5 9)"/>
  </svg>`}`:"lock2"===e?V`${W`<svg class="${o} ent-icon-lock2 ${a}" style="${i}" viewBox="0 0 20 20">
    <rect x="5" y="9" width="10" height="8" rx="2" fill="currentColor" opacity="0.9"/>
    <path d="M7 9 L7 6.5 C7 4.3 13 4.3 13 6.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
    <circle cx="10" cy="13.5" r="1.5" fill="rgba(0,0,0,0.35)"/>
  </svg>`}`:V``}const He={none:{on:"#6b7280",off:"#6b7280"},flame:{on:"#f97316",off:"#4b5563"},flame2:{on:"#f97316",off:"#4b5563"},flame3:{on:"#f97316",off:"#4b5563"},snowflake:{on:"#7dd3fc",off:"#7dd3fc"},snowflake2:{on:"#7dd3fc",off:"#7dd3fc"},snowflake3:{on:"#7dd3fc",off:"#7dd3fc"},fan:{on:"#f4601e",off:"#4b5563"},fan2:{on:"#f4601e",off:"#4b5563"},fan3:{on:"#f4601e",off:"#4b5563"},pulse:{on:"#f4601e",off:"#4b5563"},pulse2:{on:"#f4601e",off:"#4b5563"},pulse3:{on:"#f43f5e",off:"#4b5563"},wave:{on:"#f4601e",off:"#4b5563"},wave2:{on:"#5eead4",off:"#4b5563"},wave3:{on:"#7dd3fc",off:"#4b5563"},wave4:{on:"#93c5fd",off:"#4b5563"},sun:{on:"#fbbf24",off:"#4b5563"},sun2:{on:"#fbbf24",off:"#4b5563"},sun3:{on:"#fbbf24",off:"#4b5563"},lightning:{on:"#fbbf24",off:"#4b5563"},lightning2:{on:"#fbbf24",off:"#4b5563"},lightning3:{on:"#fbbf24",off:"#4b5563"},heart:{on:"#f43f5e",off:"#4b5563"},heart2:{on:"#f43f5e",off:"#4b5563"},bulb:{on:"#fde047",off:"#6b7280"},bulb2:{on:"#fbbf24",off:"#6b7280"},bulb3:{on:"#e0f2fe",off:"#6b7280"},leaf:{on:"#4ade80",off:"#4b5563"},leaf2:{on:"#4ade80",off:"#4b5563"},moon:{on:"#c4b5fd",off:"#4b5563"},moon2:{on:"#f1f5f9",off:"#4b5563"},moon3:{on:"#c4b5fd",off:"#4b5563"},water:{on:"#38bdf8",off:"#4b5563"},water2:{on:"#38bdf8",off:"#38bdf8"},water3:{on:"#38bdf8",off:"#4b5563"},lock:{on:"#a78bfa",off:"#4b5563"},lock2:{on:"#7ecfff",off:"#4b5563"},wind:{on:"#a5f3fc",off:"#4b5563"},wind2:{on:"#a5f3fc",off:"#4b5563"},wind3:{on:"#a5f3fc",off:"#4b5563"},bell:{on:"#fde68a",off:"#4b5563"},bell2:{on:"#fde68a",off:"#4b5563"},bell3:{on:"#fca5a5",off:"#4b5563"},thermometer:{on:"#fb923c",off:"#4b5563"},thermometer2:{on:"#f87171",off:"#4b5563"},thermometer3:{on:"#fb923c",off:"#4b5563"},battery:{on:"#4ade80",off:"#4b5563"},battery2:{on:"#fbbf24",off:"#4b5563"},battery3:{on:"#f87171",off:"#6b7280"},star:{on:"#fde047",off:"#4b5563"},star2:{on:"#fde047",off:"#4b5563"},star3:{on:"#fde047",off:"#4b5563"}},Ve=n`
  @keyframes flicker    { 0%{transform:scaleX(1) scaleY(1)} 33%{transform:scaleX(.95) scaleY(1.04)} 66%{transform:scaleX(1.04) scaleY(.97)} 100%{transform:scaleX(.97) scaleY(1.03)} }
  @keyframes snow-spin  { to{transform:rotate(360deg)} }
  @keyframes fan-spin   { to{transform:rotate(360deg)} }
  @keyframes blink      { 50%{opacity:.3} }
  @keyframes icon-pulse { 0%,100%{filter:drop-shadow(0 0 3px var(--ipglow,currentColor))} 50%{filter:drop-shadow(0 0 8px var(--ipglow,currentColor))} }
  @keyframes wave-scroll{ to{stroke-dashoffset:-40} }
  @keyframes drip       { 0%,100%{transform:scaleY(1)} 50%{transform:scaleY(1.06) translateY(1px)} }
  @keyframes heartbeat  { 0%,100%{transform:scale(1)} 20%{transform:scale(1.22)} 40%{transform:scale(1)} 60%{transform:scale(1.15)} }
  @keyframes leaf-sway  { 0%,100%{transform:rotate(0deg)} 33%{transform:rotate(6deg)} 66%{transform:rotate(-6deg)} }
  @keyframes snow-drift { 0%{transform:translateY(-3px) rotate(0deg)} 50%{transform:translateY(3px) rotate(180deg)} 100%{transform:translateY(-3px) rotate(360deg)} }
  @keyframes bolt-flash { 0%,100%{opacity:1} 50%{opacity:0.2} }
  @keyframes arc-flash  { 0%,100%{opacity:0.15} 50%{opacity:1} }
  @keyframes ripple-out { 0%{r:2;opacity:0.8} 100%{r:9;opacity:0} }
  @keyframes twinkle    { 0%,100%{opacity:1} 50%{opacity:0.15} }
  @keyframes cover-bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-1.5px)} }
  @keyframes wind-blow  { 0%{transform:translateX(0);opacity:0.3} 50%{opacity:1} 100%{transform:translateX(4px);opacity:0.3} }
  @keyframes bell-ring  { 0%,100%{transform:rotate(0deg)} 20%{transform:rotate(-10deg)} 40%{transform:rotate(10deg)} 60%{transform:rotate(-7deg)} 80%{transform:rotate(7deg)} }
  @keyframes therm-pulse{ 0%,100%{transform:scaleY(1)} 50%{transform:scaleY(0.65)} }
  @keyframes star-pulse { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.15);opacity:0.7} }
  @keyframes star-shoot { 0%{transform:translate(0,0);opacity:1} 100%{transform:translate(6px,-6px);opacity:0.15} }
  @keyframes ekg-scan   { to{stroke-dashoffset:-50} }
  @keyframes bar-bounce { 0%,100%{transform:scaleY(0.3)} 50%{transform:scaleY(1)} }

  /* Flame */
  .ent-icon-flame.on .flame-main { animation:flicker calc(1.5s / var(--ent-spd,1)) ease-in-out infinite alternate; transform-origin:10px 18px; }
  .ent-icon-flame.on .flame-inner { animation:flicker calc(1.5s / var(--ent-spd,1)) ease-in-out infinite alternate-reverse; transform-origin:10px 18px; }
  .ent-icon-flame2.on .flame-main { animation:flicker calc(1.5s / var(--ent-spd,1)) ease-in-out infinite alternate; transform-origin:10px 18px; }
  .ent-icon-flame2.on .flame-b    { animation:flicker calc(1.5s / var(--ent-spd,1)) ease-in-out infinite alternate-reverse; transform-origin:10px 18px; animation-delay:calc(-0.4s / var(--ent-spd,1)); }
  .ent-icon-flame3.on .flame-main { animation:flicker calc(1.2s / var(--ent-spd,1)) ease-in-out infinite alternate; transform-origin:10px 15px; }

  /* Snowflake */
  .ent-icon-snowflake  .snow-arms   { animation:snow-spin  calc(6s / var(--ent-spd,1)) linear infinite; }
  .ent-icon-snowflake2 .snow-arms   { animation:snow-spin  calc(8s / var(--ent-spd,1)) linear infinite; }
  .ent-icon-snowflake3 .snow-drift-g{ animation:snow-drift calc(4s / var(--ent-spd,1)) ease-in-out infinite; }

  /* Fan */
  .ent-icon-fan.on  .fan-blades { animation:fan-spin calc(1s   / var(--ent-spd,1)) linear infinite; }
  .ent-icon-fan2.on .fan-blades { animation:fan-spin calc(0.8s / var(--ent-spd,1)) linear infinite; }
  .ent-icon-fan3.on .fan-blades { animation:fan-spin calc(1.2s / var(--ent-spd,1)) linear infinite; }

  /* Pulse */
  .ent-icon-pulse.on  .pulse-ring  { animation:icon-pulse  calc(2s   / var(--ent-spd,1)) ease-in-out infinite; transform-origin:10px 10px; }
  .ent-icon-pulse2.on .pulse-ring  { animation:ripple-out  calc(1.2s / var(--ent-spd,1)) ease-out    infinite; }
  .ent-icon-pulse2.on .pulse-ring2 { animation:ripple-out  calc(1.2s / var(--ent-spd,1)) ease-out    infinite; animation-delay:calc(-0.5s / var(--ent-spd,1)); }
  .ent-icon-pulse3.on .ekg-line    { animation:ekg-scan    calc(1.5s / var(--ent-spd,1)) linear      infinite; stroke-dasharray:50; stroke-dashoffset:0; }

  /* Wave */
  .ent-icon-wave   .energy-wave { stroke-dasharray:40; animation:wave-scroll calc(2s   / var(--ent-spd,1)) linear infinite; }
  .ent-icon-wave2.on .bar-odd   { animation:bar-bounce  calc(0.6s / var(--ent-spd,1)) ease-in-out infinite alternate;         transform-origin:50% 100%; }
  .ent-icon-wave2.on .bar-even  { animation:bar-bounce  calc(0.6s / var(--ent-spd,1)) ease-in-out infinite alternate-reverse; transform-origin:50% 100%; }
  .ent-icon-wave3.on .arc-a { animation:twinkle calc(1.5s / var(--ent-spd,1)) ease-in-out infinite; }
  .ent-icon-wave3.on .arc-b { animation:twinkle calc(1.5s / var(--ent-spd,1)) ease-in-out infinite; animation-delay:calc(-0.5s / var(--ent-spd,1)); }
  .ent-icon-wave3.on .arc-c { animation:twinkle calc(1.5s / var(--ent-spd,1)) ease-in-out infinite; animation-delay:calc(-1s   / var(--ent-spd,1)); }
  .ent-icon-wave4.on .wifi-a { animation:twinkle calc(1.4s / var(--ent-spd,1)) ease-in-out infinite; }
  .ent-icon-wave4.on .wifi-b { animation:twinkle calc(1.4s / var(--ent-spd,1)) ease-in-out infinite; animation-delay:calc(-0.45s / var(--ent-spd,1)); }
  .ent-icon-wave4.on .wifi-c { animation:twinkle calc(1.4s / var(--ent-spd,1)) ease-in-out infinite; animation-delay:calc(-0.9s  / var(--ent-spd,1)); }

  /* Sun */
  .ent-icon-sun.on  .sun-group { animation:snow-spin calc(8s / var(--ent-spd,1)) linear infinite; }
  .ent-icon-sun3.on .sun-group { animation:snow-spin calc(4s / var(--ent-spd,1)) linear infinite; }

  /* Lightning */
  .ent-icon-lightning.on  { animation:icon-pulse calc(1.5s / var(--ent-spd,1)) ease-in-out infinite; }
  .ent-icon-lightning2.on .bolt-a { animation:bolt-flash calc(1.2s / var(--ent-spd,1)) ease-in-out infinite; }
  .ent-icon-lightning2.on .bolt-b { animation:bolt-flash calc(1.2s / var(--ent-spd,1)) ease-in-out infinite; animation-delay:calc(-0.6s / var(--ent-spd,1)); }
  .ent-icon-lightning3.on .arc-path { animation:arc-flash calc(0.8s / var(--ent-spd,1)) ease-in-out infinite; }

  /* Heart */
  .ent-icon-heart.on  .heart-shape { animation:heartbeat calc(1s   / var(--ent-spd,1)) ease-in-out infinite; transform-origin:10px 10px; }
  .ent-icon-heart2.on .heart-shape { animation:heartbeat calc(0.8s / var(--ent-spd,1)) ease-in-out infinite; transform-origin:10px 10px; }

  /* Bulb */
  .ent-icon-bulb.on  { animation:icon-pulse calc(2.5s / var(--ent-spd,1)) ease-in-out infinite; }
  .ent-icon-bulb2.on { animation:icon-pulse calc(2.5s / var(--ent-spd,1)) ease-in-out infinite; }
  .ent-icon-bulb3.on { animation:icon-pulse calc(2s   / var(--ent-spd,1)) ease-in-out infinite; }

  /* Leaf */
  .ent-icon-leaf.on  .leaf-body { animation:leaf-sway calc(3s   / var(--ent-spd,1)) ease-in-out infinite; transform-origin:10px 17px; }
  .ent-icon-leaf2.on { animation:leaf-sway calc(2.5s / var(--ent-spd,1)) ease-in-out infinite; transform-origin:10px 18px; }

  /* Moon */
  .ent-icon-moon.on  { animation:icon-pulse calc(3s / var(--ent-spd,1)) ease-in-out infinite; }
  .ent-icon-moon2.on { animation:icon-pulse calc(3s / var(--ent-spd,1)) ease-in-out infinite; }
  .ent-icon-moon3.on .star1 { animation:twinkle calc(2s / var(--ent-spd,1)) ease-in-out infinite; }
  .ent-icon-moon3.on .star2 { animation:twinkle calc(2s / var(--ent-spd,1)) ease-in-out infinite; animation-delay:calc(-0.7s  / var(--ent-spd,1)); }
  .ent-icon-moon3.on .star3 { animation:twinkle calc(2s / var(--ent-spd,1)) ease-in-out infinite; animation-delay:calc(-1.4s / var(--ent-spd,1)); }

  /* Water */
  .ent-icon-water.on   .drop-body { animation:drip       calc(2s / var(--ent-spd,1)) ease-in-out infinite; transform-origin:10px 10px; }
  .ent-icon-water2     .wave-a    { animation:wave-scroll calc(2s / var(--ent-spd,1)) linear      infinite; }
  .ent-icon-water2     .wave-b    { animation:wave-scroll calc(2s / var(--ent-spd,1)) linear      infinite; animation-delay:calc(-0.5s / var(--ent-spd,1)); }
  .ent-icon-water3.on  .ripple1   { animation:ripple-out  calc(2s / var(--ent-spd,1)) ease-out    infinite; }
  .ent-icon-water3.on  .ripple2   { animation:ripple-out  calc(2s / var(--ent-spd,1)) ease-out    infinite; animation-delay:calc(-1s / var(--ent-spd,1)); }

  /* Lock */
  .ent-icon-lock.on  { animation:icon-pulse calc(2s / var(--ent-spd,1)) ease-in-out infinite; }
  .ent-icon-lock2.on { animation:icon-pulse calc(2s / var(--ent-spd,1)) ease-in-out infinite; }

  /* Wind */
  .ent-icon-wind.on .wind-line-a { animation:wave-scroll calc(1.4s / var(--ent-spd,1)) linear infinite; stroke-dasharray:24; }
  .ent-icon-wind.on .wind-line-b { animation:wave-scroll calc(1.6s / var(--ent-spd,1)) linear infinite; stroke-dasharray:20; animation-delay:calc(-0.25s / var(--ent-spd,1)); }
  .ent-icon-wind.on .wind-line-c { animation:wave-scroll calc(1.9s / var(--ent-spd,1)) linear infinite; stroke-dasharray:16; animation-delay:calc(-0.5s  / var(--ent-spd,1)); }
  .ent-icon-wind2.on .gust-a { animation:wind-blow calc(1s / var(--ent-spd,1)) ease-in-out infinite; }
  .ent-icon-wind2.on .gust-b { animation:wind-blow calc(1s / var(--ent-spd,1)) ease-in-out infinite; animation-delay:calc(-0.33s / var(--ent-spd,1)); }
  .ent-icon-wind2.on .gust-c { animation:wind-blow calc(1s / var(--ent-spd,1)) ease-in-out infinite; animation-delay:calc(-0.66s / var(--ent-spd,1)); }
  .ent-icon-wind3.on { animation:icon-pulse calc(2s / var(--ent-spd,1)) ease-in-out infinite; }

  /* Bell */
  .ent-icon-bell.on { animation:bell-ring calc(1.2s / var(--ent-spd,1)) ease-in-out infinite; transform-origin:10px 2.5px; }
  .ent-icon-bell2.on .ring-a { animation:arc-flash calc(0.8s / var(--ent-spd,1)) ease-in-out infinite; }
  .ent-icon-bell2.on .ring-b { animation:arc-flash calc(0.8s / var(--ent-spd,1)) ease-in-out infinite; animation-delay:calc(-0.25s / var(--ent-spd,1)); }
  .ent-icon-bell2.on .ring-c { animation:arc-flash calc(0.8s / var(--ent-spd,1)) ease-in-out infinite; animation-delay:calc(-0.5s  / var(--ent-spd,1)); }
  .ent-icon-bell3.on { animation:icon-pulse calc(1.2s / var(--ent-spd,1)) ease-in-out infinite; }

  /* Thermometer */
  .ent-icon-thermometer.on  .therm-mercury { animation:therm-pulse   calc(2s   / var(--ent-spd,1)) ease-in-out infinite; transform-origin:10px 13px; }
  .ent-icon-thermometer2.on .therm-arrow   { animation:cover-bounce  calc(1.2s / var(--ent-spd,1)) ease-in-out infinite; }
  .ent-icon-thermometer3.on .therm-up      { animation:cover-bounce  calc(1.4s / var(--ent-spd,1)) ease-in-out infinite; }
  .ent-icon-thermometer3.on .therm-down    { animation:cover-bounce  calc(1.4s / var(--ent-spd,1)) ease-in-out infinite; animation-delay:calc(-0.7s / var(--ent-spd,1)); }

  /* Battery */
  .ent-icon-battery.on  { animation:icon-pulse  calc(2s   / var(--ent-spd,1)) ease-in-out infinite; }
  .ent-icon-battery2.on .charge-bolt { animation:bolt-flash calc(0.9s / var(--ent-spd,1)) ease-in-out infinite; }
  .ent-icon-battery3.on { animation:blink       calc(1.2s / var(--ent-spd,1)) step-end    infinite; }

  /* Star */
  .ent-icon-star.on  { animation:star-pulse calc(2s   / var(--ent-spd,1)) ease-in-out infinite; transform-origin:10px 10px; }
  .ent-icon-star2.on .star-body { animation:fan-spin calc(3s / var(--ent-spd,1)) linear infinite; transform-origin:10px 10px; }
  .ent-icon-star3.on { animation:star-shoot calc(1.5s / var(--ent-spd,1)) ease-in-out infinite alternate; }
`,We=[{value:"none",label:"None",group:""},{value:"flame",label:"Flame",group:"🔥"},{value:"flame2",label:"Double",group:"🔥"},{value:"flame3",label:"Campfire",group:"🔥"},{value:"snowflake",label:"Snow",group:"❄️"},{value:"snowflake2",label:"6-arm",group:"❄️"},{value:"snowflake3",label:"Drifting",group:"❄️"},{value:"fan",label:"Fan 3",group:"🌀"},{value:"fan2",label:"Fan 4",group:"🌀"},{value:"fan3",label:"Vortex",group:"🌀"},{value:"lightning",label:"Bolt",group:"⚡"},{value:"lightning2",label:"Double",group:"⚡"},{value:"lightning3",label:"Arc",group:"⚡"},{value:"bulb",label:"Bulb",group:"💡"},{value:"bulb2",label:"Edison",group:"💡"},{value:"bulb3",label:"LED",group:"💡"},{value:"water",label:"Drop",group:"💧"},{value:"water2",label:"Waves",group:"💧"},{value:"water3",label:"Ripple",group:"💧"},{value:"sun",label:"Sun",group:"☀️"},{value:"sun2",label:"Sunrise",group:"☀️"},{value:"sun3",label:"Burst",group:"☀️"},{value:"moon",label:"Crescent",group:"🌙"},{value:"moon2",label:"Full",group:"🌙"},{value:"moon3",label:"Stars",group:"🌙"},{value:"pulse",label:"Pulse",group:"◉"},{value:"pulse2",label:"Double",group:"◉"},{value:"pulse3",label:"EKG",group:"◉"},{value:"wave",label:"Wave",group:"〜"},{value:"wave2",label:"Equalizer",group:"〜"},{value:"wave3",label:"Signal",group:"〜"},{value:"wave4",label:"WiFi",group:"〜"},{value:"heart",label:"Heart",group:"❤️"},{value:"heart2",label:"Outline",group:"❤️"},{value:"leaf",label:"Leaf",group:"🌿"},{value:"leaf2",label:"Sprout",group:"🌿"},{value:"lock",label:"Lock",group:"🔒"},{value:"lock2",label:"Unlocked",group:"🔒"},{value:"wind",label:"Flow",group:"💨"},{value:"wind2",label:"Gusts",group:"💨"},{value:"wind3",label:"Spiral",group:"💨"},{value:"bell",label:"Bell",group:"🔔"},{value:"bell2",label:"Ring",group:"🔔"},{value:"bell3",label:"Alarm",group:"🔔"},{value:"thermometer",label:"Therm",group:"🌡️"},{value:"thermometer2",label:"Hot",group:"🌡️"},{value:"thermometer3",label:"Cold/Hot",group:"🌡️"},{value:"battery",label:"Battery",group:"🔋"},{value:"battery2",label:"Charging",group:"🔋"},{value:"battery3",label:"Low",group:"🔋"},{value:"star",label:"Star",group:"⭐"},{value:"star2",label:"Sparkle",group:"⭐"},{value:"star3",label:"Shoot",group:"⭐"}];var Ge;let qe=Ge=class extends ce{constructor(){super(...arguments),this.preview=!1,this._closedAreas=new Set,this._entityListOpen=new Set,this._graphData=new Map,this._valveDragPos=null,this._trvDragTemp=null,this._trvBtnTimer=null,this._graphDialog=null,this._cloudDetailOpen=null,this._graphFetching=new Set,this._graphFetchedAt=new Map,this._cachedDevices=null,this._cacheEntitiesRef=null,this._cacheDevicesRef=null,this._cacheConfigRef=null,this._fetchQueue=[],this._fetchQueueRunning=!1}static getConfigElement(){return document.createElement("ha-device-dashboard-editor")}static getStubConfig(){return{type:"custom:ha-device-dashboard"}}static getLayoutOptions(){return{grid_columns:10,grid_min_columns:4,grid_min_rows:3}}setConfig(e){this._config=e}getCardSize(){return 6}disconnectedCallback(){super.disconnectedCallback(),this._graphFetching.clear(),this._graphFetchedAt.clear(),this._graphData=new Map}_getDevices(){if(!this.hass)return[];const e=this.hass.entities,t=this.hass.devices;if(this._cachedDevices&&e===this._cacheEntitiesRef&&t===this._cacheDevicesRef&&this._config===this._cacheConfigRef)return this._cachedDevices;this._cacheEntitiesRef=e,this._cacheDevicesRef=t,this._cacheConfigRef=this._config;let i=we(this.hass);const o=this._config.areas;if(void 0!==o){const e=new Set(o.map(e=>e.toLowerCase()));i=i.filter(t=>e.has((t.area??"").toLowerCase()))}if(!1===this._config.show_offline&&(i=i.filter(e=>this._isOnline(e))),this._config.hidden_devices?.length){const e=new Set(this._config.hidden_devices);i=i.filter(t=>!e.has(t.device_id))}return this._cachedDevices=i,i}_groupByArea(e){const t=new Map;for(const i of e){const e=i.area??"";t.has(e)||t.set(e,[]),t.get(e).push(i)}const i=this._config.sort_by??"name";return new Map([...t.entries()].sort(([e],[t])=>e?t?e.localeCompare(t):-1:1).map(([e,t])=>[e,t.sort("power"===i?(e,t)=>(this._getPower(t)??-1)-(this._getPower(e)??-1):"online"===i?(e,t)=>Number(this._isOnline(t))-Number(this._isOnline(e))||e.name.localeCompare(t.name):(e,t)=>e.name.localeCompare(t.name))]))}_isOnline(e){return e.entities.some(e=>{const t=this.hass.states[e.entity_id];return t&&"unavailable"!==t.state&&"unknown"!==t.state})}_getPower(e){let t=0,i=!1;for(const o of e.entities){const e=this.hass.states[o.entity_id];if(!e)continue;const a=e.attributes;if(null!=a.current_power_w){const e=Number(a.current_power_w);isNaN(e)||(t+=e,i=!0);continue}if("sensor"===o.domain&&"power"===a.device_class){const o=parseFloat(e.state);isNaN(o)||(t+=o,i=!0)}}return i?t:null}_getPrimarySwitch(e){for(const t of e.entities){if("switch"!==t.domain&&"light"!==t.domain)continue;const e=this.hass.states[t.entity_id];if(!e)continue;const i=e.attributes;let o,a,r,n;if("light"===t.domain){o="on"===e.state&&null!=i.brightness?Math.round(i.brightness/Ge.BRIGHTNESS_MAX*100):0;const t=i.supported_color_modes??[];if(t.some(e=>["rgb","rgbw","rgbww","hs","xy"].includes(e))&&(a=t),i.rgbw_color){const[e,t,o,a]=i.rgbw_color;r=[e,t,o],n=a}else i.rgb_color&&(r=i.rgb_color)}return{entityId:t.entity_id,isOn:"on"===e.state,brightness:o,colorModes:a,rgbColor:r,whiteValue:n}}return null}_getTrv(e){const t=e.entities.find(e=>"climate"===e.domain);if(!t)return null;const i=this.hass.states[t.entity_id];if(!i)return null;const o=i.attributes;let a=o.current_valve_position??o.valve_position;if(null==a){const t=e.entities.find(e=>"sensor"===e.domain&&e.entity_id.includes("valve"));if(t){const e=parseFloat(this.hass.states[t.entity_id]?.state??"");isNaN(e)||(a=e)}}return{entityId:t.entity_id,currentTemp:o.current_temperature,targetTemp:o.temperature,minTemp:o.min_temp??4,maxTemp:o.max_temp??30,step:o.target_temp_step??.5,hvacMode:i.state,hvacAction:o.hvac_action??i.state,presetMode:o.preset_mode,presetModes:(o.preset_modes??[]).filter(e=>"none"!==e),valvePosition:a}}_getCover(e){const t=e.entities.find(e=>"cover"===e.domain);if(!t)return null;const i=this.hass.states[t.entity_id];return i?{entityId:t.entity_id,state:i.state,position:i.attributes?.current_position}:null}_getValve(e){const t=e.entities.find(e=>"valve"===e.domain);if(!t)return null;const i=this.hass.states[t.entity_id];if(!i)return null;const o=!!(4&i.attributes?.supported_features);let a=i.attributes?.current_position;if(null==a){const t=e.entities.find(e=>"sensor"===e.domain&&e.entity_id.includes("position"));if(t){const e=parseFloat(this.hass.states[t.entity_id]?.state??"");isNaN(e)||(a=e)}}const r=e.entities.find(e=>{if("number"!==e.domain)return!1;const t=this.hass.states[e.entity_id];if(!t)return!1;const i=t.attributes;return 0===i.min&&100===i.max||e.entity_id.includes("position")});let n;const s=e.entities.find(e=>"sensor"===e.domain&&"temperature"===this.hass.states[e.entity_id]?.attributes?.device_class);if(s){const e=parseFloat(this.hass.states[s.entity_id]?.state??"");isNaN(e)||(n=e)}return{entityId:t.entity_id,state:i.state,position:a,supportsPosition:o,numEntityId:r?.entity_id,temperature:n}}async _setValvePosition(e,t,i){const o=Math.round(Math.max(0,Math.min(100,t)));i?await this.hass.callService("number","set_value",{entity_id:i,value:o}):await this.hass.callService("valve","set_valve_position",{entity_id:e,position:o})}_getAlerts(e){const t=[];for(const i of e.entities){if("binary_sensor"!==i.domain)continue;const e=this.hass.states[i.entity_id];if(!e||"on"!==e.state)continue;const o=e.attributes.device_class??"";"heat"===o||i.entity_id.includes("overtemp")?t.push("overtemp"):("safety"===o||i.entity_id.includes("overpower"))&&t.push("overpower")}return t}_getFirmware(e){for(const t of e.entities){if("update"!==t.domain)continue;const e=this.hass.states[t.entity_id];if(!e||"on"!==e.state)continue;const i=e.attributes;return{entityId:t.entity_id,current:i.installed_version??"",newVersion:i.latest_version}}return null}_chLabel(e){const t=e.match(/[_-]([abc])[_-](?:act_power|aprt_power|ret_power|voltage|current|pf|freq)/i);if(t)return t[1].toUpperCase();const i=e.match(/[_-](?:switch|channel|ch|output)_?(\d+)[_-]/i)??e.match(/[_-](\d+)[_-](?:power|energy|voltage|current|apparent|reactive|factor|freq)/i)??e.match(/(?:power|energy|voltage|current|freq|apparent|reactive)[_-](\d+)$/i);return i?"Ch "+(+i[1]+1):""}_timeAgo(e){if(!e)return"Never";const t=Date.now()-new Date(e).getTime();return isNaN(t)||t<0?"Never":t<6e4?"Just now":t<36e5?`${Math.floor(t/6e4)}m ago`:t<864e5?`${Math.floor(t/36e5)}h ago`:`${Math.floor(t/864e5)}d ago`}_getSensors(e){const t=this._config.sensors?.length?new Set(this._config.sensors):null,i=e=>!t||t.has(e),o=[],a=new Set,r=new Set(["power","energy","current","voltage","apparent_power","reactive_power","power_factor","frequency"]),n=new Map;for(const t of e.entities){const e=this.hass.states[t.entity_id];if(!e||"unavailable"===e.state||"unknown"===e.state)continue;const i=e.attributes?.device_class??"";r.has(i)&&(n.has(i)||n.set(i,[]),n.get(i).push(t.entity_id))}const s=new Set([...n.entries()].filter(([,e])=>e.length>1).map(([e])=>e)),l=(e,t,i,r=!1,n)=>{const l=n&&s.has(e)?`${e}_${this._chLabel(n)}`:e;a.has(l)||(a.add(l),o.push({label:t,value:i,warn:r}))};for(const t of e.entities){const e=this.hass.states[t.entity_id];if(!e||"unavailable"===e.state||"unknown"===e.state)continue;const o=e.attributes.device_class??"",a=t.entity_id;if("sensor"===t.domain){if(!o&&(a.endsWith("_ip")||a.endsWith("_ip_address"))&&i("ip")){l("ip","IP",e.state);continue}if(!o&&a.endsWith("_ssid")&&i("ssid")){l("ssid","SSID",e.state);continue}if(!o&&(a.endsWith("_firmware")||a.endsWith("_fw"))&&i("fw_version")){l("fw_version","FW",e.state);continue}if(!o&&a.endsWith("_mac")&&i("mac")){l("mac","MAC",e.state);continue}const t=parseFloat(e.state);if(isNaN(t))continue;const r=s.size?this._chLabel(a):"",n=e=>s.has(e)&&r?` ${r}`:"";"power"===o&&i("power")?l("power",`Power${n("power")}`,Se(t),!1,a):"apparent_power"===o&&i("apparent_power")?l("apparent_power",`App.P${n("apparent_power")}`,Be(t),!1,a):"reactive_power"===o&&i("reactive_power")?l("reactive_power",`Re.P${n("reactive_power")}`,Ee(t),!1,a):"power_factor"===o&&i("power_factor")?l("power_factor",`PF${n("power_factor")}`,Re(t),!1,a):"frequency"===o&&i("frequency")?l("frequency",`Freq${n("frequency")}`,De(t),!1,a):"energy"===o&&i("energy")?l("energy",`Energy${n("energy")}`,Ae(t),!1,a):"voltage"===o&&i("voltage")?l("voltage",`Volt${n("voltage")}`,ze(t),!1,a):"current"===o&&i("current")?l("current",`Curr${n("current")}`,Me(t),!1,a):"temperature"===o&&i("temperature")?l("temperature","Temp",Te(t)):"humidity"===o&&i("humidity")?l("humidity","Hum",Fe(t)):"illuminance"===o&&i("illuminance")?l("illuminance","Light",Ie(t)):"carbon_dioxide"===o&&i("co2")?l("co2","CO₂",Le(t)):"gas"===o&&i("gas")?l("gas","Gas",`${t.toFixed(1)} %`):"battery"===o&&i("battery")?l("battery","Batt",Re(t)):("signal_strength"===o||a.includes("rssi"))&&i("rssi")?l("rssi","Wi-Fi",`${Pe(t)} (${t} dBm)`):a.includes("uptime")&&i("uptime")&&l("uptime","Uptime",Oe(t))}else if("binary_sensor"===t.domain){const t="on"===e.state;"motion"===o&&i("motion")?l("motion","Motion",t?"Motion":"Clear"):"door"!==o&&"window"!==o&&"opening"!==o||!i("door")?"moisture"===o&&i("flood")?l("flood","Flood",t?"Flooded":"Dry",t):"smoke"===o&&i("smoke")?l("smoke","Smoke",t?"Smoke!":"Clear",t):"gas"===o&&i("gas")?l("gas","Gas",t?"Gas!":"Clear",t):"vibration"===o&&i("vibration")?l("vibration","Vibr",t?"Vibrating":"Clear"):("heat"===o||a.includes("overtemp"))&&i("overtemp")?l("overtemp","Overtemp",t?"Overtemp!":"OK",t):("safety"===o||a.includes("overpower"))&&i("overpower")?l("overpower","Overpower",t?"Overpower!":"OK",t):"connectivity"===o&&a.includes("cloud")&&i("cloud")?l("cloud","Cloud",t?"Connected":"Offline",!t):"connectivity"===o&&a.includes("mqtt")&&i("mqtt")?l("mqtt","MQTT",t?"Connected":"Offline",!t):"connectivity"===o&&a.includes("eth")&&i("eth")&&l("eth","Ethernet",t?"Connected":"Offline",!t):l("door","Door",t?"Open":"Closed")}}return o}_getInputChannels(e){const t=e.entities.filter(e=>"binary_sensor"===e.domain&&(e.entity_id.includes("input")||e.entity_id.includes("button")||e.entity_id.includes("channel")||null==e.attributes?.device_class)),i=e.entities.filter(e=>"event"===e.domain&&("button"===e.attributes?.device_class||e.entity_id.includes("channel")||e.entity_id.includes("input")));return t.length>0?t.map(t=>{const i=this.hass.states[t.entity_id],o=i?.attributes?.friendly_name??"",a=t.entity_id.match(/(?:input|channel|button)[_\s]*(\d+)/i)??o.match(/(\d+)\s*$/),r=a?parseInt(a[1]):0,n=t.entity_id.replace(/^binary_sensor\./,""),s=e.entities.find(e=>"event"===e.domain&&e.entity_id.replace(/^event\./,"")===n),l=s?this.hass.states[s.entity_id]:null,c=l?.attributes?.event_type??(l?.state&&"unknown"!==l.state&&"unavailable"!==l.state?l.state:null);return{entityId:t.entity_id,label:a?"Input "+(+a[1]+1):o||t.entity_id,isOn:"on"===i?.state,isButton:!!s,channel:r,lastEvent:c,lastChanged:i?.last_changed??null}}).sort((e,t)=>e.channel-t.channel):i.map(e=>{const t=this.hass.states[e.entity_id],i=t?.attributes?.friendly_name??"",o=e.entity_id.match(/(?:input|channel|button)[_\s]*(\d+)/i)??i.match(/(\d+)\s*$/),a=o?parseInt(o[1]):0,r=t?.attributes?.event_type??(t?.state&&"unknown"!==t.state&&"unavailable"!==t.state?t.state:null),n=t?.last_changed??(t?.state&&"unknown"!==t.state&&"unavailable"!==t.state?t.state:null);return{entityId:e.entity_id,label:o?"Input "+(+o[1]+1):i||e.entity_id,isOn:!1,isButton:!0,channel:a,lastEvent:r,lastChanged:n}}).sort((e,t)=>e.channel-t.channel)}async _toggle(e,t,i){i.stopPropagation();const o=e.split(".")[0];await this.hass.callService(o,t?"turn_off":"turn_on",{entity_id:e})}async _setBrightness(e,t){await this.hass.callService("light","turn_on",{entity_id:e,brightness_pct:Math.max(1,Math.min(100,t))})}_rgbToHex(e,t,i){return"#"+[e,t,i].map(e=>e.toString(16).padStart(2,"0")).join("")}_hexToRgb(e){return[parseInt(e.slice(1,3),16),parseInt(e.slice(3,5),16),parseInt(e.slice(5,7),16)]}async _setColor(e,t,i,o=!1){const a=this._hexToRgb(t);o&&void 0!==i?await this.hass.callService("light","turn_on",{entity_id:e,rgbw_color:[...a,i]}):await this.hass.callService("light","turn_on",{entity_id:e,rgb_color:a})}async _coverAction(e,t,i){i.stopPropagation();await this.hass.callService("cover",{open:"open_cover",close:"close_cover",stop:"stop_cover"}[t],{entity_id:e})}async _setCoverPosition(e,t){await this.hass.callService("cover","set_cover_position",{entity_id:e,position:Math.round(Math.max(0,Math.min(100,t)))})}async _valveAction(e,t,i){i.stopPropagation();await this.hass.callService("valve",{open:"open_valve",close:"close_valve",stop:"stop_valve"}[t],{entity_id:e})}async _setTemp(e,t){await this.hass.callService("climate","set_temperature",{entity_id:e,temperature:Math.round(2*t)/2})}async _setHvacMode(e,t,i){i.stopPropagation(),await this.hass.callService("climate","set_hvac_mode",{entity_id:e,hvac_mode:t})}_setPresetMode(e,t){this.hass.callService("climate","set_preset_mode",{entity_id:e,preset_mode:t})}async _installUpdate(e,t){t.stopPropagation(),await this.hass.callService("update","install",{entity_id:e})}async _selectOption(e,t){await this.hass.callService("select","select_option",{entity_id:e,option:t})}async _setNumberValue(e,t){await this.hass.callService("number","set_value",{entity_id:e,value:String(t)})}async _pressButton(e,t){t.stopPropagation(),await this.hass.callService("button","press",{entity_id:e})}_getGraphEntities(e){const t=this._config.graph_sensors??[];if(!t.length)return[];const i=[];for(const o of t){const t=e.entities.filter(e=>{if("sensor"!==e.domain)return!1;const t=this.hass.states[e.entity_id];if(!t||"unavailable"===t.state||"unknown"===t.state)return!1;return(t.attributes?.device_class??e.attributes?.device_class)===o||"signal_strength"===o&&e.entity_id.includes("rssi")}),a=new Set;for(const e of t){const r=this.hass.states[e.entity_id]?.attributes?.unit_of_measurement??"",n=t.length>1?this._chLabel(e.entity_id).replace("Ch ",""):"",s=(je[o]??o)+(n?` ${n}`:"");a.has(s)||(a.add(s),i.push({entityId:e.entity_id,label:s,dc:o,unit:r}))}}return i}_requestGraphData(e){if(this._graphFetching.has(e))return;Date.now()-(this._graphFetchedAt.get(e)??0)<3e5&&this._graphData.has(e)||(this._fetchQueue.includes(e)||this._fetchQueue.push(e),this._drainFetchQueue())}_drainFetchQueue(){if(this._fetchQueueRunning||0===this._fetchQueue.length)return;this._fetchQueueRunning=!0;const e=this._fetchQueue.shift();Promise.resolve().then(async()=>{await this._fetchGraphData(e),this._fetchQueueRunning=!1,this._drainFetchQueue()})}_retryGraphData(e){if(this._graphFetching.has(e))return;this._graphFetchedAt.delete(e);const t=new Map(this._graphData);t.delete(e),this._graphData=t,this._fetchQueue=this._fetchQueue.filter(t=>t!==e),this._requestGraphData(e)}_refreshAllGraphs(e){const t=this._getGraphEntities(e).map(e=>e.entityId).filter(e=>!this._graphFetching.has(e));t.forEach(e=>this._graphFetchedAt.delete(e));const i=new Map(this._graphData);t.forEach(e=>i.delete(e)),this._graphData=i,t.forEach(e=>this._fetchGraphData(e))}async _fetchGraphData(e){this._graphFetching.add(e);try{const t=this._config.graph_hours??24,i=`history/period/${new Date(Date.now()-36e5*t).toISOString()}?filter_entity_id=${e}&minimal_response=true&no_attributes=true`,o=await this.hass.callApi("GET",i);let a=(o?.[0]??[]).map(e=>({t:new Date(e.last_changed).getTime(),v:parseFloat(e.state)})).filter(e=>!isNaN(e.v));if(1===a.length){const t=parseFloat(this.hass.states[e]?.state??"");a.push({t:Date.now(),v:isNaN(t)?a[0].v:t})}const r=new Map(this._graphData);r.set(e,a),this._graphData=r}catch(t){console.warn("[ha-device-dashboard] history fetch failed",e,t);const i=new Map(this._graphData);i.set(e,[]),this._graphData=i}finally{this._graphFetchedAt.set(e,Date.now()),this._graphFetching.delete(e)}}_renderSparklines(e,t=!1){const i=this._getGraphEntities(e);if(!i.length)return V``;const o=this._config.graph_style??{},a=200,r=t?120:o.height??32,n=t||null!=o.height,s=o.line_width??1.5,l=!1!==o.show_dots,c=!1!==o.tick_lines,d=!1!==o.time_labels,p=o.type??"line",u="area"===p,h=this._config.graph_hours??24,g=h<=1?6e4:h<=5?12e4:3e5,f=this._config.graph_sensor_colors??{},v=this._config.graph_line_color,b=e=>new Date(e).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}),m=i.map(({entityId:i,label:o,unit:h,dc:m})=>{const x=f[m]??v??Ne.find(e=>e.key===m)?.defaultColor??"#f4601e",y=this._graphData.get(i);if(this._requestGraphData(i),!y)return V`
          <div class="spark-row">
            <span class="spark-lbl">${o}</span>
            <div class="sparkline-loading" style="height:${n?r:32}px"></div>
            <span class="spark-val">—</span>
          </div>`;if(y.length<2)return V`
          <div class="spark-row">
            <span class="spark-lbl">${o}</span>
            <span class="spark-no-data">no history</span>
            <button class="spark-retry" @click=${e=>{e.stopPropagation(),this._retryGraphData(i)}}>↺</button>
          </div>`;const _=y.map(e=>e.v),w=Math.min(..._),$=Math.max(..._),k=$-w||1,C=y[0].t,S=y[y.length-1].t,A=S-C||1,z=e=>(e.t-C)/A*a,M=e=>r-4-(e.v-w)/k*(r-8),T=y.map(e=>`${z(e).toFixed(1)},${M(e).toFixed(1)}`).join(" "),O=z(y[0]).toFixed(1),P=`sg-${i.replace(/[^a-z0-9]/gi,"")}`,B=_[_.length-1],E=B%1==0?`${B}`:B.toFixed(1),D=_.indexOf($),F=_.indexOf(w),I=z(y[D]).toFixed(1),L=M(y[D]).toFixed(1),R=z(y[F]).toFixed(1),N=M(y[F]).toFixed(1),j=b(y[0].t),U=b((y[0].t+S)/2),H=g/A*a,G=`${Math.max(.3,.7*H).toFixed(2)} ${Math.max(.3,.3*H).toFixed(2)}`,Y=l&&$-w>0;return V`
        <div class="spark-group">
          <div class="spark-row ${t?"":"spark-row-clickable"}" @click=${t?q:t=>{t.stopPropagation(),this._graphDialog=e.device_id}}>
            <span class="spark-lbl">${o}</span>
            <div class="spark-svg-wrap">
              <svg viewBox="0 0 ${a} ${r}" preserveAspectRatio="none"
                class="sparkline-svg"
                style="height:${n?r:32}px"
                @mousemove=${e=>{const t=e.currentTarget,i=t.getBoundingClientRect(),o=Math.max(0,Math.min(1,(e.clientX-i.left)/i.width)),r=C+o*A;let n=y[0];for(const e of y)Math.abs(e.t-r)<Math.abs(n.t-r)&&(n=e);const s=z(n),l=M(n),c=t.querySelector(".spark-crosshair");c&&(c.setAttribute("x1",String(s)),c.setAttribute("x2",String(s)),c.style.display="");const d=t.querySelector(".spark-hover-dot");d&&(d.setAttribute("cx",String(s)),d.setAttribute("cy",String(l)),d.style.display="");const p=t.parentElement,u=p?.querySelector(".spark-tooltip");if(u){const e=u.querySelector(".spark-tooltip-val"),t=u.querySelector(".spark-tooltip-time");e&&(e.textContent=`${n.v%1==0?String(n.v):n.v.toFixed(1)} ${h}`),t&&(t.textContent=b(n.t)),u.style.left=`${(s/a*100).toFixed(1)}%`,u.style.display=""}}} @mouseleave=${e=>{const t=e.currentTarget;t.querySelector(".spark-crosshair")?.style&&(t.querySelector(".spark-crosshair").style.display="none"),t.querySelector(".spark-hover-dot")?.style&&(t.querySelector(".spark-hover-dot").style.display="none");const i=t.parentElement?.querySelector(".spark-tooltip");i&&(i.style.display="none")}}>
                <defs>
                  <linearGradient id="${P}" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="${x}" stop-opacity="0.3"/>
                    <stop offset="100%" stop-color="${x}" stop-opacity="0"/>
                  </linearGradient>
                </defs>
                ${c?W`
                  <line x1="0"        x2="0"        y1="0" y2="${r}" class="spark-tick"/>
                  <line x1="${100}" x2="${100}" y1="0" y2="${r}" class="spark-tick"/>
                  <line x1="${a}"     x2="${a}"     y1="0" y2="${r}" class="spark-tick"/>
                `:q}
                ${"bar"!==p&&u?W`
                  <polygon points="${T} ${a},${r-4} ${O},${r-4}" fill="url(#${P})"/>
                `:q}
                ${"bar"===p?y.map(e=>{const t=Math.max(2,a/y.length-2),i=z(e)-t/2,o=M(e),n=r-4-o;return W`<rect x="${i.toFixed(1)}" y="${o.toFixed(1)}" width="${t.toFixed(1)}" height="${Math.max(0,n).toFixed(1)}" rx="1.5" fill="${x}" opacity="0.75"/>`}):W`
                    <polyline points="${T}" fill="none"
                      stroke="${x}" stroke-width="${s}"
                      stroke-linecap="round" stroke-linejoin="round"/>
                  `}
                <line x1="0" y1="${r}" x2="${a}" y2="${r}"
                  stroke="rgba(255,255,255,0.5)" stroke-width="0.8"
                  stroke-dasharray="${G}" pointer-events="none"
                  vector-effect="non-scaling-stroke"/>
                ${Y?W`
                  <circle cx="${I}" cy="${L}" r="3"
                    fill="${x}" stroke="#1e1e2e" stroke-width="1.2"/>
                  <circle cx="${R}" cy="${N}" r="2.5"
                    fill="#6b7280" stroke="#1e1e2e" stroke-width="1.2"/>
                `:q}
                <line class="spark-crosshair" x1="0" x2="0" y1="0" y2="${r}" style="display:none"/>
                <circle class="spark-hover-dot" cx="0" cy="0" r="3.5" style="display:none"/>
              </svg>
              <div class="spark-tooltip" style="display:none">
                <span class="spark-tooltip-val"></span>
                <span class="spark-tooltip-time"></span>
              </div>
            </div>
            <span class="spark-val">${E} ${h}</span>
          </div>
          ${d?V`
            <div class="spark-time-row">
              <div class="spark-time-spacer"></div>
              <div class="spark-time-labels">
                <span>${j}</span><span>${U}</span><span>now</span>
              </div>
              <div class="spark-time-end"></div>
            </div>
          `:q}
        </div>`});return V`
      <div class="sparklines-block ${t?"exp":""}">
        ${m}
      </div>`}_renderGraphDialog(){if(!this._graphDialog)return V``;const e=this._getDevices().find(e=>e.device_id===this._graphDialog);return e?V`
      <div class="graph-dialog-backdrop" @click=${()=>this._graphDialog=null}>
        <div class="graph-dialog" @click=${e=>e.stopPropagation()}>
          <div class="graph-dialog-header">
            <span>${e.name}</span>
            <button class="graph-dialog-close" @click=${()=>this._graphDialog=null}>✕</button>
          </div>
          ${this._renderSparklines(e,!0)}
        </div>
      </div>`:V``}_getBlockOrder(e,t){const i=this._config.device_styles?.[e.device_id]?.tile_layout;return i||(this._config.tile_layout?this._config.tile_layout:ke[t.type]??ke.generic)}_trvColor(e){const t=Math.max(0,Math.min(1,e));let i,o,a;if(t<.5){const e=2*t;i=Math.round(74+156*e),o=Math.round(144+-18*e),a=Math.round(217+-183*e)}else{const e=2*(t-.5);i=Math.round(230+-1*e),o=Math.round(126+-69*e),a=Math.round(34+19*e)}return`rgb(${i},${o},${a})`}_renderTrvDial(e){const{minTemp:t,maxTemp:i,targetTemp:o,currentTemp:a,step:r,entityId:n}=e,s=this._trvDragTemp??o??t,l=Math.max(0,Math.min(1,(s-t)/(i-t))),c=e=>210+(e-t)/(i-t)*300,d=(e,t)=>[80+t*Math.cos((e-90)*Math.PI/180),70+t*Math.sin((e-90)*Math.PI/180)],p=(e,t,i)=>{const[o,a]=d(e,i),[r,n]=d(t,i);return`M ${o} ${a} A ${i} ${i} 0 ${t-e>180?1:0} 1 ${r} ${n}`},u=this._trvColor(l),h=c(s),[g,f]=d(h,54),v=null!=a?(a-t)/(i-t):null,b=null!=a?d(c(a),54):null,m=null!=v?this._trvColor(v):u,x=`trv-grad-${n.replace(/\W/g,"_")}`;return W`
      <svg viewBox="0 0 160 132" class="trv-dial-svg valve-interactive" @pointerdown=${e=>{e.stopPropagation();const o=e.currentTarget;o.setPointerCapture(e.pointerId);const a=e=>{const a=this._trvTempFromEvent(e,o,t,i,r);null!=a&&(this._trvDragTemp=a)},s=e=>{const l=this._trvTempFromEvent(e,o,t,i,r)??this._trvDragTemp;this._trvDragTemp=null,null!=l&&this._setTemp(n,l),o.removeEventListener("pointermove",a),o.removeEventListener("pointerup",s)};o.addEventListener("pointermove",a),o.addEventListener("pointerup",s)}}>
        <defs>
          <linearGradient id="${x}" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%"   stop-color="${this._trvColor(0)}"/>
            <stop offset="50%"  stop-color="${this._trvColor(.5)}"/>
            <stop offset="100%" stop-color="${this._trvColor(1)}"/>
          </linearGradient>
        </defs>
        <path d="${p(210,510,54)}" fill="none" stroke="transparent" stroke-width="22" stroke-linecap="round"/>
        <path d="${p(210,510,54)}" fill="none" stroke="url(#${x})" stroke-width="8" stroke-linecap="round" opacity="0.25"/>
        ${h>210?W`<path d="${p(210,h,54)}" fill="none" stroke="url(#${x})" stroke-width="8" stroke-linecap="round"/>`:q}
        ${b?W`<circle cx="${b[0]}" cy="${b[1]}" r="5" fill="white" stroke="${m}" stroke-width="2"/>`:q}
        <circle cx="${g}" cy="${f}" r="9" fill="${u}" stroke="white" stroke-width="2" style="cursor:grab"/>
        <text x="${80}" y="${60}" text-anchor="middle" class="dial-target-text">${s.toFixed(1)}°</text>
        <text x="${80}" y="${75}" text-anchor="middle" class="dial-sub-text">target</text>
        <text x="${80}" y="${88}" text-anchor="middle" class="dial-current-text">${null!=a?`now ${a}°`:""}</text>
        <text x="18" y="128" text-anchor="middle" class="dial-range-text">${t}°</text>
        <text x="142" y="128" text-anchor="middle" class="dial-range-text">${i}°</text>
      </svg>
    `}_trvTempFromEvent(e,t,i,o,a){const r=t.getBoundingClientRect(),n=(e.clientX-r.left)*(160/r.width),s=(e.clientY-r.top)*(132/r.height);let l=Math.atan2(s-70,n-80)*(180/Math.PI)+90;l<0&&(l+=360);const c=(l-210+360)%360;if(c>300)return null;const d=i+c/300*(o-i);return Math.max(i,Math.min(o,Math.round(d/a)*a))}_valvePosFromEvent(e,t){const i=t.getBoundingClientRect(),o=(e.clientX-i.left)*(160/i.width),a=(e.clientY-i.top)*(128/i.height);let r=Math.atan2(a-68,o-80)*(180/Math.PI)+90;r<0&&(r+=360);const n=(r-210+360)%360;return n>300?null:Math.round(n/300*100)}_renderValveDial(e){const t=e.position??("open"===e.state?100:0),i=(e,t)=>[80+t*Math.cos((e-90)*Math.PI/180),68+t*Math.sin((e-90)*Math.PI/180)],o=(e,t,o)=>{const[a,r]=i(e,o),[n,s]=i(t,o);return`M ${a} ${r} A ${o} ${o} 0 ${t-e>180?1:0} 1 ${n} ${s}`},a=e.supportsPosition||!!e.numEntityId,r=this._valveDragPos??t,n=(e=>210+e/100*300)(r),[s,l]=i(n,54),c=`hsl(${200+.2*r}, ${40+.55*r}%, ${38+.18*r}%)`,d=null!=this._valveDragPos?`${Math.round(this._valveDragPos)}%`:"opening"===e.state?"Opening…":"closing"===e.state?"Closing…":100===t?"Open":0===t?"Closed":"Partial",p=a?t=>{t.stopPropagation();const i=t.currentTarget;i.setPointerCapture(t.pointerId);const o=e=>{const t=this._valvePosFromEvent(e,i);null!=t&&(this._valveDragPos=t)},a=t=>{const r=this._valvePosFromEvent(t,i)??this._valveDragPos;this._valveDragPos=null,null!=r&&this._setValvePosition(e.entityId,r,e.numEntityId),i.removeEventListener("pointermove",o),i.removeEventListener("pointerup",a)};i.addEventListener("pointermove",o),i.addEventListener("pointerup",a)}:void 0;return W`
      <svg viewBox="0 0 160 128" class="trv-dial-svg ${a?"valve-interactive":""}"
        @pointerdown=${p}>
        <defs>
          <linearGradient id="valve-grad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%"   stop-color="#6b7280"/>
            <stop offset="100%" stop-color="#0ea5e9"/>
          </linearGradient>
        </defs>
        ${a?W`<path d="${o(210,510,54)}" fill="none" stroke="transparent" stroke-width="22" stroke-linecap="round"/>`:q}
        <path d="${o(210,510,54)}" fill="none" stroke="url(#valve-grad)" stroke-width="8" stroke-linecap="round" opacity="0.25"/>
        ${t>0?W`<path d="${o(210,n,54)}" fill="none" stroke="url(#valve-grad)" stroke-width="8" stroke-linecap="round"/>`:q}
        <circle cx="${s}" cy="${l}" r="9" fill="${c}" stroke="white" stroke-width="2" style="${a?"cursor:grab":""}"/>
        <text x="${80}" y="${60}" text-anchor="middle" class="dial-target-text">${Math.round(r)}%</text>
        <text x="${80}" y="${75}" text-anchor="middle" class="dial-sub-text">${d}</text>
        <text x="16" y="124" text-anchor="middle" class="dial-range-text">Closed</text>
        <text x="144" y="124" text-anchor="middle" class="dial-range-text">Open</text>
      </svg>
    `}_getVirtualControls(e){return e.entities.filter(e=>!("select"!==e.domain||!/_enum_\d+$/i.test(e.entity_id))||(!("number"!==e.domain||!/_number_\d+$/i.test(e.entity_id))||(!("button"!==e.domain||!/_button_\d+$/i.test(e.entity_id))||(!("text"!==e.domain||!/_text_\d+$/i.test(e.entity_id))||!("switch"!==e.domain||!/_boolean_\d+$/i.test(e.entity_id)))))).map(e=>{const t=this.hass.states[e.entity_id],i=t?.attributes??{};return{entityId:e.entity_id,domain:e.domain,label:i.friendly_name??e.entity_id.split(".").pop().replace(/_/g," "),value:t?.state??"unavailable",options:i.options,min:i.min,max:i.max,step:i.step,isOn:"on"===t?.state}})}_renderTileIcon(e,t,i={}){const{coverPos:o,coverState:a,isHeating:r,valveOpen:n,hasFan:s}=i,l=e.type;if("relay"===l||"plug"===l)return s?W`<svg class="tile-icon tile-icon-fan ${t?"on":""}" viewBox="0 0 20 20">
          <g class="fan-blades">
            <path d="M10 10 C10 6,13 4,13 8 A3 3 0 0 1 10 10Z" fill="currentColor" opacity=".9"/>
            <path d="M10 10 C14 10,16 13,12 13 A3 3 0 0 1 10 10Z" fill="currentColor" opacity=".9"/>
            <path d="M10 10 C10 14,7 16,7 12 A3 3 0 0 1 10 10Z" fill="currentColor" opacity=".9"/>
            <path d="M10 10 C6 10,4 7,8 7 A3 3 0 0 1 10 10Z" fill="currentColor" opacity=".9"/>
          </g>
          <circle cx="10" cy="10" r="2" fill="currentColor"/>
        </svg>`:W`<svg class="tile-icon tile-icon-relay ${t?"on":""}" viewBox="0 0 20 20">
        <path d="M11 2L4 11h6l-1 7 7-9h-6l1-7z" fill="currentColor"/>
      </svg>`;if("dimmer"===l||"rgb"===l)return W`<svg class="tile-icon tile-icon-sun ${t?"on":""}" viewBox="0 0 20 20">
        <circle cx="10" cy="10" r="3.5" fill="currentColor"/>
        <g class="sun-rays" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
          <line x1="10" y1="1.5" x2="10" y2="3.5"/>
          <line x1="10" y1="16.5" x2="10" y2="18.5"/>
          <line x1="1.5" y1="10" x2="3.5" y2="10"/>
          <line x1="16.5" y1="10" x2="18.5" y2="10"/>
          <line x1="4.1" y1="4.1" x2="5.5" y2="5.5"/>
          <line x1="14.5" y1="14.5" x2="15.9" y2="15.9"/>
          <line x1="4.1" y1="15.9" x2="5.5" y2="14.5"/>
          <line x1="14.5" y1="5.5" x2="15.9" y2="4.1"/>
        </g>
      </svg>`;if("cover"===l){const e=o??("open"===a?100:"closed"===a?0:50),t="opening"===a||"closing"===a,i=[2,5.5,9,12.5,16],r=Math.ceil(e/100*i.length);return W`<svg class="tile-icon tile-icon-cover ${t?"moving":""}" viewBox="0 0 20 20">
        <rect x="2" y="1" width="16" height="1.5" rx="0.75" fill="currentColor" opacity=".7"/>
        <line x1="10" y1="2.5" x2="10" y2="18.5" stroke="currentColor" stroke-width="1" opacity=".4"/>
        ${i.map((e,t)=>W`<rect x="3" y="${e}" width="14" height="1.8" rx="0.5"
          fill="currentColor" opacity="${t<r?"0.85":"0.2"}"/>`)}
      </svg>`}return"climate"===l||"wall_display"===l?W`<svg class="tile-icon tile-icon-flame ${r?"on":""}" viewBox="0 0 20 20">
        <path class="flame-main" d="M10 18 C5 18 3 14 5 10 C6 8 7 9 7 9 C7 6 9 3 10 2 C10 5 12 6 12 9 C12 9 13 7 14 8 C16 11 15 18 10 18Z" fill="currentColor"/>
        <path class="flame-inner" d="M10 16 C8 16 7 14 8 12 C8.5 11 9 11.5 9 11.5 C9 10 10 9 10 9 C10 10.5 11 11 11 12.5 C12 11 12 14 10 16Z" fill="currentColor" opacity=".5"/>
      </svg>`:"valve"===l?W`<svg class="tile-icon tile-icon-valve ${n?"on":""}" viewBox="0 0 20 20">
        <path class="drop-body" d="M10 3 C10 3 4 10 4 13.5 A6 6 0 0 0 16 13.5 C16 10 10 3 10 3Z" fill="currentColor"/>
        <path class="drop-shine" d="M7.5 12 C7 10.5 8 9 8 9" stroke="white" stroke-width="1" stroke-linecap="round" fill="none" opacity=".5"/>
      </svg>`:"energy"===l?W`<svg class="tile-icon tile-icon-energy" viewBox="0 0 20 20">
        <polyline class="energy-wave" points="1,10 4,6 7,14 10,4 13,14 16,6 19,10"
          fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>`:"sensor"===l?W`<svg class="tile-icon tile-icon-sensor" viewBox="0 0 20 20">
        <rect x="8.5" y="2" width="3" height="11" rx="1.5" fill="currentColor" opacity=".5"/>
        <circle cx="10" cy="14.5" r="3" fill="currentColor"/>
        <rect x="9.2" y="7" width="1.6" height="7" rx="0.8" fill="currentColor"/>
      </svg>`:"input"===l||"uni"===l?W`<svg class="tile-icon tile-icon-input ${t?"on":""}" viewBox="0 0 20 20">
        <path d="M8 4 C8 3 9 2 10 2 C11 2 12 3 12 4 L12 10.5 C13 9.8 15 10 15 11.5 L15 14 C15 16.5 13 18 10 18 C7 18 5 16.5 5 14 L5 4Z" fill="currentColor" opacity=".7"/>
        <circle class="input-ripple" cx="10" cy="4" r="0" fill="none" stroke="currentColor" stroke-width="1"/>
      </svg>`:W`<svg class="tile-icon tile-icon-generic" viewBox="0 0 20 20">
      <circle cx="10" cy="10" r="5" fill="none" stroke="currentColor" stroke-width="1.8" opacity=".6"/>
      <circle cx="10" cy="10" r="2" fill="currentColor" opacity=".6"/>
    </svg>`}_renderEntityAnim(e,t,i){const o=this._config.device_styles?.[i]?.entity_animations?.[e];if(!o)return V``;const a=(t?o.on:o.off)??"none";return"none"===a?V``:Ue(a,t,`--ent-spd:${o.speed??1}`,"ent-icon")}_renderBlock(e,t,i){const o=this._getPrimarySwitch(t),a=this._getTrv(t),r=this._getCover(t),n=this._getValve(t),s=this._getAlerts(t),l=this._isOnline(t),c=this._getFirmware(t),d=this._getPower(t),p=this._getSensors(t),u=this._getInputChannels(t),h=o?.isOn??!1,g=void 0!==o?.brightness,f=g&&h?Math.max(1,o.brightness??1):0,v=!!o?.colorModes?.length,b=v&&o.rgbColor?this._rgbToHex(...o.rgbColor):"#ffffff",m=v&&(o.colorModes?.some(e=>"rgbw"===e||"rgbww"===e)??!1),x="heat"===a?.hvacMode,y="ble"===i.gen?"BLE":"other"===i.gen?"":`G${i.gen}`,_=(w=t.integration,Ce[w.toLowerCase()]??w.toUpperCase().slice(0,6));var w,$;switch(e){case"name_row":{const e=this._config.device_styles?.[t.device_id],i=h?e?.tile_icon:e?.tile_icon_off??e?.tile_icon;let s;if(i)s=Ue(i,h,`--ent-spd:${e?.tile_icon_speed??1}`,"tile-icon");else if(n){const e=n.position??("open"===n.state?100:0),t=e>66?"water2":e>33?"water3":e>0?"water":void 0;s=t?Ue(t,!0,"--ent-spd:1","tile-icon"):V``}else if(a){const e="heating"===a.hvacAction,t=a.valvePosition,i=e?null!=t?t>66?"flame3":t>33?"flame2":"flame":"flame":void 0;s=i?Ue(i,!0,"--ent-spd:1","tile-icon"):V``}else s=V``;const d=o?this._renderEntityAnim(o.entityId,h,t.device_id):V``;return V`
          <div class="tile-top">
            <div class="tile-left">
              <span class="dot ${l?"online":"offline"}"></span>
              ${s}
              ${d}
              <span class="tile-name">${t.name}</span>
              ${c?V`<span class="update-dot" title="Firmware update">●</span>`:q}
            </div>
            ${r?V`
              <div class="cov-btns" @click=${e=>e.stopPropagation()}>
                <button class="cov-btn" @click=${e=>this._coverAction(r.entityId,"open",e)}>▲</button>
                <button class="cov-btn stop" @click=${e=>this._coverAction(r.entityId,"stop",e)}>■</button>
                <button class="cov-btn" @click=${e=>this._coverAction(r.entityId,"close",e)}>▼</button>
              </div>
            `:o?V`
              <button class="tog ${h?"on":"off"}"
                @click=${e=>this._toggle(o.entityId,h,e)}>
                ${h?"ON":"OFF"}
              </button>
            `:a?V`
              <button class="tog ${x?"on":"off"}"
                @click=${e=>this._setHvacMode(a.entityId,x?"off":"heat",e)}>
                ${x?"HEAT":"OFF"}
              </button>
            `:q}
          </div>
        `}case"sensors":return p.length?V`
          <div class="tile-sensor-chips">
            ${p.map(e=>V`
              <div class="tile-sensor-chip ${e.warn?"warn":""}">
                <span class="tsc-lbl">${e.label}</span>
                <span class="tsc-val">${e.value}</span>
              </div>
            `)}
          </div>
        `:V``;case"graph":return this._renderSparklines(t);case"dimmer":{const e=o?this.hass.states[o.entityId]:null,t=e?.attributes?.effect_list??[],i=e?.attributes?.effect??null,a=o?.whiteValue??0;return o&&g?V`
          <div class="tile-dim-row" @click=${e=>e.stopPropagation()}>
            ${v?V`
              <input type="color" class="color-swatch tile-color-swatch" .value=${b}
                ?disabled=${!h}
                @change=${e=>{e.stopPropagation(),this._setColor(o.entityId,e.target.value,a,m)}}/>
            `:q}
            <input type="range" class="dim-slider" min="1" max="100"
              style=${ye(v?{accentColor:b}:{})}
              .value=${String(h?Math.max(1,o.brightness??1):1)}
              ?disabled=${!h}
              @input=${e=>{const t=e.target.closest(".tile-dim-row")?.querySelector(".dim-pct");t&&(t.textContent=`${e.target.value}%`)}}
              @change=${e=>{this._setBrightness(o.entityId,parseInt(e.target.value,10))}}/>
            <span class="dim-pct">${f}%</span>
          </div>
          ${m?V`
            <div class="tile-dim-row tile-white-row" @click=${e=>e.stopPropagation()}>
              <span class="dim-white-lbl">W</span>
              <input type="range" class="dim-slider white-slider" min="0" max="255"
                .value=${String(a)}
                @input=${e=>{const t=e.target.closest(".tile-white-row")?.querySelector(".white-pct");t&&(t.textContent=e.target.value)}}
                @change=${e=>{const t=parseInt(e.target.value,10);this._setColor(o.entityId,b,t,!0)}}/>
              <span class="white-pct dim-pct">${a}</span>
            </div>
          `:q}
          ${t.length>1?V`
            <div class="tile-effects" @click=${e=>e.stopPropagation()}>
              ${t.filter(e=>"Off"!==e).map(e=>V`
                <button class="effect-btn ${i===e?"active":""}"
                  @click=${t=>{t.stopPropagation();const a=i===e;this.hass.callService("light","turn_on",{entity_id:o.entityId,effect:a?"Off":e})}}>
                  ${e}
                </button>`)}
            </div>
          `:q}
        `:V``}case"cover_controls":return r?V`
          <div class="cov-pos-row" @click=${e=>e.stopPropagation()}>
            <div class="cov-bar">
              <div class="cov-fill" style="width:${r.position??("open"===r.state?100:0)}%"></div>
            </div>
            <span class="cov-pct">${null!=r.position?`${Math.round(r.position)}%`:r.state}</span>
          </div>
        `:V``;case"trv_control":{const e=t.entities.find(e=>"sensor"===e.domain&&"battery"===this.hass.states[e.entity_id]?.attributes?.device_class),i=null!=e&&parseFloat(this.hass.states[e.entity_id]?.state??"")||null,o={comfort:"🏠",eco:"🌿",boost:"🚀",away:"🌙",none:"❄️"};return a?V`
          <div class="tile-trv-dial" @click=${e=>e.stopPropagation()}>
            ${this._renderTrvDial(a)}
            <div class="trv-dial-btns">
              <button class="trv-step" @click=${()=>{const e=this._trvDragTemp??a.targetTemp;if(null==e)return;const t=Math.max(a.minTemp,Math.round(100*(e-a.step))/100);this._trvDragTemp=t,this._trvBtnTimer&&clearTimeout(this._trvBtnTimer),this._trvBtnTimer=setTimeout(()=>{this._setTemp(a.entityId,this._trvDragTemp??t),this._trvDragTemp=null},600)}}>−</button>
              <span class="trv-flame">${"heating"===a.hvacAction?"🔥":""}</span>
              <button class="trv-step" @click=${()=>{const e=this._trvDragTemp??a.targetTemp;if(null==e)return;const t=Math.min(a.maxTemp,Math.round(100*(e+a.step))/100);this._trvDragTemp=t,this._trvBtnTimer&&clearTimeout(this._trvBtnTimer),this._trvBtnTimer=setTimeout(()=>{this._setTemp(a.entityId,this._trvDragTemp??t),this._trvDragTemp=null},600)}}>+</button>
            </div>
            <div class="trv-stat-row">
              <div class="trv-stat"><span class="trv-stat-lbl">Now</span><span class="trv-stat-val">${null!=a.currentTemp?`${a.currentTemp}°`:"—"}</span></div>
              <div class="trv-stat"><span class="trv-stat-lbl">Set</span><span class="trv-stat-val">${null!=a.targetTemp?`${a.targetTemp.toFixed(1)}°`:"—"}</span></div>
              ${null!=a.valvePosition?V`<div class="trv-stat"><span class="trv-stat-lbl">Valve</span><span class="trv-stat-val">${Math.round(a.valvePosition)}%</span></div>`:q}
              ${null!=i?V`<div class="trv-stat"><span class="trv-stat-lbl">Batt</span><span class="trv-stat-val">${i}%</span></div>`:q}
            </div>
            ${a.presetModes.length?V`
              <div class="trv-presets">
                ${a.presetModes.map(e=>V`
                  <button class="trv-preset-btn ${a.presetMode===e?"active":""}"
                    @click=${()=>this._setPresetMode(a.entityId,e)}>
                    ${(o[e]??"")+e}
                  </button>
                `)}
              </div>
            `:q}
          </div>
        `:V``}case"input_channels":return u.length?V`
          <div class="tile-inputs" @click=${e=>e.stopPropagation()}>
            ${u.map(e=>V`
              <div class="input-row ${e.isButton?"btn-mode":e.isOn?"active":""}">
                <span class="${e.isButton?"input-btn-dot":"input-row-dot"}"></span>
                <span class="input-row-name">${e.label}</span>
                <span class="input-row-event">${e.lastEvent?e.lastEvent.replace(/_/g," "):"—"}</span>
                <span class="input-row-time">${this._timeAgo(e.lastChanged)}</span>
              </div>
            `)}
          </div>
        `:V``;case"virtual_controls":{const e=this._getVirtualControls(t);return e.length?V`
          <div class="tile-virtuals" @click=${e=>e.stopPropagation()}>
            ${e.map(e=>{if("unavailable"===e.value)return q;if("select"===e.domain){const t=e.options??[],i=t.indexOf(e.value);return V`
                  <div class="virt-row">
                    <span class="virt-lbl">${e.label}</span>
                    <div class="virt-select">
                      <button class="virt-arr" @click=${()=>{const o=t[(i-1+t.length)%t.length];this._selectOption(e.entityId,o)}}>‹</button>
                      <span class="virt-val">${e.value.replace(/_/g," ")}</span>
                      <button class="virt-arr" @click=${()=>{const o=t[(i+1)%t.length];this._selectOption(e.entityId,o)}}>›</button>
                    </div>
                  </div>`}if("number"===e.domain){const t=parseFloat(e.value),i=e.step??1,o=i<1?String(i).split(".")[1]?.length??1:0;return V`
                  <div class="virt-row">
                    <span class="virt-lbl">${e.label}</span>
                    <div class="virt-num">
                      <button class="virt-arr" @click=${()=>this._setNumberValue(e.entityId,Math.max(e.min??0,+(t-i).toFixed(o)))}>−</button>
                      <span class="virt-val">${isNaN(t)?e.value:t.toFixed(o)}</span>
                      <button class="virt-arr" @click=${()=>this._setNumberValue(e.entityId,Math.min(e.max??100,+(t+i).toFixed(o)))}>+</button>
                    </div>
                  </div>`}return"button"===e.domain?V`
                  <div class="virt-row">
                    <button class="virt-btn" @click=${t=>this._pressButton(e.entityId,t)}>${e.label}</button>
                  </div>`:"text"===e.domain?V`
                  <div class="virt-row">
                    <span class="virt-lbl">${e.label}</span>
                    <span class="virt-val">${e.value}</span>
                  </div>`:"switch"===e.domain?V`
                  <div class="virt-row">
                    <span class="virt-lbl">${e.label}</span>
                    <button class="tog sm ${e.isOn?"on":"off"}"
                      @click=${t=>this._toggle(e.entityId,e.isOn,t)}>
                      ${e.isOn?"ON":"OFF"}
                    </button>
                  </div>`:q})}
          </div>`:V``}case"relay_channels":{const e=t.entities.filter(e=>"switch"===e.domain&&/_(switch|relay|channel)_\d/.test(e.entity_id));return e.length<=1?V``:V`
          <div class="relay-channels" @click=${e=>e.stopPropagation()}>
            ${e.map(e=>{const i=this.hass.states[e.entity_id],o="on"===i?.state,a=i?.attributes?.friendly_name??e.entity_id;return V`
                <div class="relay-ch-row">
                  <span class="relay-ch-dot ${o?"on":""}"></span>
                  ${this._renderEntityAnim(e.entity_id,o,t.device_id)}
                  <span class="relay-ch-name">${a}</span>
                  <button class="tog sm ${o?"on":"off"}"
                    @click=${t=>this._toggle(e.entity_id,o,t)}>
                    ${o?"ON":"OFF"}
                  </button>
                </div>`})}
          </div>`}case"valve_controls":{const e=this._getValve(t);return e?V`
          <div class="tile-trv-dial" @click=${e=>e.stopPropagation()}>
            ${this._renderValveDial(e)}
            <div class="valve-dial-btns">
              <button class="valve-btn close" @click=${t=>this._valveAction(e.entityId,"close",t)}>Close</button>
              <button class="valve-btn stop" @click=${t=>this._valveAction(e.entityId,"stop",t)}>■</button>
              <button class="valve-btn open" @click=${t=>this._valveAction(e.entityId,"open",t)}>Open</button>
            </div>
          </div>
        `:V``}case"power_bar":return this._renderPowerBar(t);case"badges":return V`
          <div class="tile-bot">
            ${null!=d?V`<span class="tile-power">${Se(d)}</span>`:q}
            <div class="tile-badges">
              ${s.map(e=>V`<span class="alert-badge alert-${e}">${"overtemp"===e?"🌡":"⚡"}!</span>`)}
              ${i.label?V`<span class="type-badge type-${i.type}">${i.label}</span>`:q}
              ${y?V`<span class="gen-badge gen-${i.gen}">${y}</span>`:q}
              ${_?V`<span class="int-badge-tile">${_}</span>`:q}
              ${t.isShelly&&t.ip&&($=t.ip,/^10\./.test($)||/^192\.168\./.test($)||/^172\.(1[6-9]|2\d|3[01])\./.test($)||/^169\.254\./.test($))?V`
                <a href="http://${t.ip}" target="_blank" class="tile-ui-link"
                  @click=${e=>e.stopPropagation()}>↗</a>
              `:q}
            </div>
          </div>
        `;default:return V``}}_renderPowerBar(e){if(!this._config.show_power_bar)return V``;const t=this._getPower(e)??0,i=this._config.power_bar_max??2e3;return V`
      <div class="power-bar" title="${t.toFixed(0)} W">
        <div class="power-bar-fill" style="width:${Math.min(100,t/i*100)}%"></div>
      </div>`}_renderTile(e){const t=this._isOnline(e),i=function(e){const t=(e.model??"").toLowerCase(),i=new Set(e.entities.map(e=>e.domain));let o;if(i.has("climate")&&i.has("switch"))o="wall_display";else if(i.has("climate"))o="climate";else if(i.has("cover"))o="cover";else if(i.has("valve"))o="valve";else if(i.has("light")){const t=e.entities.some(e=>"light"===e.domain&&(e.attributes?.supported_color_modes??[]).some(e=>["rgb","rgbw","rgbww","hs","xy"].includes(e)));o=t?"rgb":"dimmer"}else if(e.entities.some(e=>"event"===e.domain&&"button"===e.attributes?.device_class)&&!e.entities.some(e=>"switch"===e.domain&&/_(switch|relay)_\d/.test(e.entity_id)))o="input";else if(i.has("switch"))o=t.includes("uni")?"uni":!t.includes("plug")&&(e.entities.some(e=>"binary_sensor"===e.domain&&e.entity_id.includes("input"))||t.includes("1pm")||t.includes("2pm")||t.includes("pro "))?"relay":"plug";else{const t=e.entities.some(e=>"sensor"===e.domain&&("power"===e.attributes?.device_class||"energy"===e.attributes?.device_class||"apparent_power"===e.attributes?.device_class)),i=e.entities.some(e=>"binary_sensor"===e.domain&&(e.entity_id.includes("input")||e.entity_id.includes("button")||e.entity_id.includes("channel")||null==e.attributes?.device_class)||"event"===e.domain&&("button"===e.attributes?.device_class||e.entity_id.includes("channel")||e.entity_id.includes("input"))),a=e.entities.some(e=>"sensor"===e.domain&&["temperature","humidity","illuminance","moisture","battery","gas"].includes(e.attributes?.device_class??"")),r=e.entities.some(e=>"binary_sensor"===e.domain&&["motion","door","window","moisture","smoke","gas","vibration","opening"].includes(e.attributes?.device_class??""));o=t?"energy":!i||a||r?"sensor":"input"}const a=e.isShelly?function(e){const t=e.toLowerCase();return t.includes("blu")||t.includes("bluetooth")?"ble":t.includes("g4")||t.includes("gen4")||t.includes("gen 4")?4:t.includes("g3")||t.includes("gen3")||t.includes("gen 3")||/^s3/i.test(e)?3:t.includes("plus")||t.includes("pro")||/^sn/i.test(e)?2:1}(e.model??""):"other";return{type:o,gen:a,label:$e[o],integration:e.integration}}(e),o=this._config.tile_size??"md",a=this._config.device_styles?.[e.device_id]?.color,r={};a&&(r.borderColor=a,r.boxShadow=`0 0 12px ${a}50`);const n=this._config.device_styles?.[e.device_id]?.tile_layout??this._config.tile_layout??ke[i.type]??["name_row","sensors","graph","dimmer","cover_controls","trv_control","valve_controls","input_channels","relay_channels","power_bar","badges"];return V`
      <div class="tile ${t?"":"offline"} tile-${o}"
        style=${ye(r)}>
        ${n.map(t=>this._renderBlock(t,e,i))}
      </div>
    `}_getAreaChips(e){const t=this._config.sensors?.length?new Set(this._config.sensors):null,i=e=>!t||t.has(e),o={},a=(e,t)=>{o[e]||(o[e]={sum:0,count:0}),o[e].sum+=t,o[e].count++};for(const t of e)for(const e of t.entities){if("sensor"!==e.domain)continue;const t=this.hass.states[e.entity_id];if(!t||"unavailable"===t.state||"unknown"===t.state)continue;const o=parseFloat(t.state);if(isNaN(o))continue;const r=t.attributes.device_class??"";"power"===r&&i("power")?a("power",o):"energy"===r&&i("energy")?a("energy",o):"temperature"===r&&i("temperature")?a("temperature",o):"humidity"===r&&i("humidity")?a("humidity",o):"carbon_dioxide"===r&&i("co2")?a("co2",o):"illuminance"===r&&i("illuminance")&&a("illuminance",o)}const r=[];return o.power&&r.push({label:"Power",value:Se(o.power.sum)}),o.energy&&r.push({label:"Energy",value:Ae(o.energy.sum)}),o.temperature&&r.push({label:"Temp",value:Te(o.temperature.sum/o.temperature.count)}),o.humidity&&r.push({label:"Hum",value:Fe(o.humidity.sum/o.humidity.count)}),o.co2&&r.push({label:"CO₂",value:Le(o.co2.sum/o.co2.count)}),o.illuminance&&r.push({label:"Light",value:Ie(o.illuminance.sum/o.illuminance.count)}),r}_renderAreaSection(e,t){if(!t.length)return V``;const i=e||"No Area",o=this._closedAreas.has(e),a=t.filter(e=>this._isOnline(e)).length,r=t.reduce((e,t)=>e+(this._getPower(t)??0),0),n=this._config.area_styles?.[i],s=n?.columns??this._config.columns??3;this._config.style;const l={};n&&(n.bgImage?(l.backgroundImage=`url('${n.bgImage}')`,l.backgroundSize="stretch"===n.bgImageSize?"100% 100%":n.bgImageSize??"contain",l.backgroundPosition="center",l.backgroundRepeat="no-repeat"):n.bgColor&&(l.background=n.bgColor),(n.borderColor||n.borderWidth)&&(l.border=`${n.borderWidth??1}px ${n.borderStyle??"solid"} ${n.borderColor??"var(--divider-color)"}`),n.borderRadius&&(l.borderRadius=`${n.borderRadius}px`,l.overflow="hidden"),n.headerBgColor&&(l["--area-header-bg"]=n.headerBgColor2?`linear-gradient(${n.headerBgDir??"to right"}, ${n.headerBgColor}, ${n.headerBgColor2})`:n.headerBgColor),n.textColor&&(l["--area-header-color"]=n.textColor),n.fontSize&&(l["--area-name-size"]=`${n.fontSize}px`),n.fontWeight&&(l["--area-name-weight"]=n.fontWeight),n.tileBgColor&&(l["--sc-tile-bg"]=n.tileBgColor),n.tileBorderColor&&(l["--sc-tile-border"]=n.tileBorderColor),null!=n.tileBorderRadius&&(l["--tile-radius"]=`${n.tileBorderRadius}px`),null!=n.tileGap&&(l["--tile-gap"]=`${n.tileGap}px`),n.tileTextColor&&(l["--sc-text-primary"]=n.tileTextColor),n.accentColor&&(l["--sc-accent"]=n.accentColor,l["--sc-graph-line"]=n.accentColor,l["--sc-accent-glow"]=`${n.accentColor}59`));const c=t.map(e=>this._renderTile(e)),d=this._getAreaChips(t);return V`
      <div class="area-section ${o?"closed":""}" style=${ye(l)}>
        <div class="area-header" @click=${()=>{const t=new Set(this._closedAreas);t.has(e)?t.delete(e):t.add(e),this._closedAreas=t}}>
          <span class="area-name">${i}</span>
          ${d.length?V`
            <div class="area-chips">
              ${d.map(e=>V`
                <div class="area-chip">
                  <span class="tsc-lbl">${e.label}</span>
                  <span class="tsc-val">${e.value}</span>
                </div>`)}
            </div>`:q}
          <div class="area-meta">
            <span class="area-count">${a}/${t.length}</span>
            ${r>0?V`<span class="area-power">${Se(r)}</span>`:q}
            <span class="chevron ${o?"":"open"}">▼</span>
          </div>
        </div>
        ${o?q:V`
          <div class="device-grid" style="--cols:${s}">
            ${c}
          </div>
        `}
      </div>
    `}_renderExpanded(e){const t=this._getSensors(e),i=this._getFirmware(e),o=this._getTrv(e),a=this._getCover(e),r=this._getValve(e),n=!1!==this._config.show_entity_list,s=this._entityListOpen.has(e.device_id);return V`
      <div class="expanded" @click=${e=>e.stopPropagation()}>

        ${a?V`
          <div class="exp-section exp-section--cover">
            <div class="exp-label">Cover</div>
            <div class="trv-mode-row">
              <button class="tog sm ${"open"===a.state?"on":"off"}" @click=${e=>this._coverAction(a.entityId,"open",e)}>Open</button>
              <button class="tog sm off" @click=${e=>this._coverAction(a.entityId,"stop",e)}>Stop</button>
              <button class="tog sm ${"closed"===a.state?"on":"off"}" @click=${e=>this._coverAction(a.entityId,"close",e)}>Close</button>
            </div>
            ${null!=a.position?V`
              <div class="dim-wrap" style="margin-top:8px">
                <span class="trv-range-lbl">0%</span>
                <input type="range" class="dim-slider" min="0" max="100" step="5"
                  style="accent-color:var(--sc-accent)"
                  .value=${String(a.position)}
                  @change=${e=>{e.stopPropagation(),this._setCoverPosition(a.entityId,parseFloat(e.target.value))}}/>
                <span class="trv-range-lbl">100%</span>
              </div>
              <div style="text-align:center;font-size:12px;color:var(--sc-text-secondary);margin-top:2px">Position: ${Math.round(a.position)}%</div>
            `:q}
          </div>
        `:q}

        ${o?V`
          <div class="exp-section exp-section--trv">
            <div class="exp-label">Thermostat</div>
            <div class="trv-ctrl-row">
              <button class="trv-big-btn" @click=${e=>{e.stopPropagation(),null!=o.targetTemp&&this._setTemp(o.entityId,Math.max(o.minTemp,o.targetTemp-o.step))}}>−</button>
              <div class="trv-display">
                <span class="trv-target-big">${null!=o.targetTemp?o.targetTemp.toFixed(1):"—"}°</span>
                ${null!=o.currentTemp?V`<span class="trv-current-sub">now ${o.currentTemp}°</span>`:q}
                ${"heating"===o.hvacAction?V`<span class="trv-action-badge heating">Heating</span>`:q}
              </div>
              <button class="trv-big-btn" @click=${e=>{e.stopPropagation(),null!=o.targetTemp&&this._setTemp(o.entityId,Math.min(o.maxTemp,o.targetTemp+o.step))}}>+</button>
            </div>
            <div class="dim-wrap" style="margin:4px 0 8px">
              <span class="trv-range-lbl">${o.minTemp}°</span>
              <input type="range" class="dim-slider" .min=${String(o.minTemp)} .max=${String(o.maxTemp)} .step=${String(o.step)}
                style="accent-color:var(--sc-accent)" .value=${String(o.targetTemp??o.minTemp)}
                @change=${e=>{e.stopPropagation(),this._setTemp(o.entityId,parseFloat(e.target.value))}}/>
              <span class="trv-range-lbl">${o.maxTemp}°</span>
            </div>
            <div class="trv-mode-row">
              <button class="tog sm ${"heat"===o.hvacMode?"on":"off"}" @click=${e=>this._setHvacMode(o.entityId,"heat",e)}>Heat</button>
              <button class="tog sm ${"off"===o.hvacMode?"on":"off"}" @click=${e=>this._setHvacMode(o.entityId,"off",e)}>Off</button>
            </div>
          </div>
        `:q}

        ${r?V`
          <div class="exp-section">
            <div class="exp-label">Valve</div>
            <div class="trv-mode-row">
              <button class="tog sm ${"open"===r.state?"on":"off"}" @click=${e=>this._valveAction(r.entityId,"open",e)}>Open</button>
              <button class="tog sm off" @click=${e=>this._valveAction(r.entityId,"stop",e)}>Stop</button>
              <button class="tog sm ${"closed"===r.state?"on":"off"}" @click=${e=>this._valveAction(r.entityId,"close",e)}>Close</button>
            </div>
            ${null!=r.position?V`
              <div class="dim-wrap" style="margin-top:8px">
                <span class="trv-range-lbl">0%</span>
                <input type="range" class="dim-slider" min="0" max="100" step="5"
                  style="accent-color:var(--sc-accent)"
                  .value=${String(r.position)}
                  @change=${e=>{e.stopPropagation(),this._setValvePosition(r.entityId,parseFloat(e.target.value))}}/>
                <span class="trv-range-lbl">100%</span>
              </div>
              <div style="text-align:center;font-size:12px;color:var(--sc-text-secondary);margin-top:2px">Position: ${Math.round(r.position)}%</div>
            `:q}
          </div>
        `:q}

        ${t.length?V`
          <div class="exp-section">
            <div class="exp-label">Sensors</div>
            <div class="sensor-row">
              ${t.map(e=>V`
                <div class="sensor-chip">
                  <span class="sensor-label">${e.label}</span>
                  <span class="sensor-value ${e.warn?"warn":""}">${e.value}</span>
                </div>
              `)}
            </div>
          </div>
        `:q}

        ${i?V`
          <div class="exp-section">
            <div class="exp-label">Firmware update available</div>
            <div class="exp-row">
              <span class="exp-name">${i.newVersion??"New version"}</span>
              <button class="tog sm update" @click=${e=>this._installUpdate(i.entityId,e)}>Install</button>
            </div>
          </div>
        `:q}

        ${n?V`
          <div class="exp-section exp-section--full">
            <div class="ent-list-header" @click=${t=>{t.stopPropagation();const i=new Set(this._entityListOpen);s?i.delete(e.device_id):i.add(e.device_id),this._entityListOpen=i}}>
              <span class="exp-label" style="margin:0">All Entities (${e.entities.length})</span>
              <span class="ent-caret ${s?"open":""}">▼</span>
            </div>
            ${s?V`
              <div class="ent-list">
                ${e.entities.filter(e=>!(this._config.hidden_entities??[]).includes(e.entity_id)).map(e=>{const t=this.hass.states[e.entity_id],i=t?.state??"unavailable",o=t?.attributes?.unit_of_measurement??"",a=t?.attributes?.friendly_name??e.entity_id.split(".")[1].replace(/_/g," "),r=["switch","light","input_boolean","fan"].includes(e.domain);return V`
                      <div class="ent-row">
                        <span class="ent-domain">${e.domain}</span>
                        <span class="ent-name">${a}</span>
                        <span class="ent-state">${o?`${i} ${o}`:i}</span>
                        ${r?V`
                          <button class="tog sm ${"on"===i?"on":"off"}"
                            @click=${t=>this._toggle(e.entity_id,"on"===i,t)}>
                            ${"on"===i?"ON":"OFF"}
                          </button>
                        `:q}
                      </div>
                    `})}
              </div>
            `:q}
          </div>
        `:q}

      </div>
    `}render(){if(!this._config||!this.hass)return V``;const e=new Set(["hui-card-picker","hui-cards-used-card-picker"]);let t=this,i=!1;for(;t;){if(t instanceof Element&&e.has(t.tagName.toLowerCase())){i=!0;break}const o=t.getRootNode();if(o===t||o===document)break;t=o.host}if(i)return V`
        <ha-card>
          <div style="padding:20px;text-align:center;color:var(--secondary-text-color,#9ca3af);">
            <div style="font-size:2em;margin-bottom:8px">📡</div>
            <div style="font-weight:600;margin-bottom:4px">HA Device Dashboard</div>
            <div style="font-size:.85em">Add the card to configure rooms and devices</div>
          </div>
        </ha-card>`;const o=this._getDevices(),a=this._config.style??{};if(!o.length)return V`
        <ha-card>
          <div class="empty">
            <p>No devices found.</p>
            <p class="hint">No devices found matching your filters.</p>
          </div>
        </ha-card>`;const r=o.filter(e=>this._isOnline(e)).length,n=o.length-r,s=o.reduce((e,t)=>e+(this._getPower(t)??0),0),l=o.filter(e=>this._getAlerts(e).length>0),c=this._groupByArea(o),d=Object.values(this.hass.states).filter(e=>e.entity_id.startsWith("binary_sensor.")&&e.entity_id.endsWith("_cloud")),p=d.filter(e=>"on"===e.state),u=d.filter(e=>"off"===e.state),h=d.filter(e=>"unavailable"===e.state),g=e=>(e.attributes.friendly_name??e.entity_id).replace(/\s*[Cc]loud$/,"").trim(),f={};a.accent_color&&(f["--sc-accent"]=a.accent_color),a.tile_radius&&(f["--tile-radius"]=`${a.tile_radius}px`),a.tile_gap&&(f["--tile-gap"]=`${a.tile_gap}px`),a.font_family&&(f["--sc-font-family"]=a.font_family),a.text_transform&&(f["--sc-text-transform"]=a.text_transform),a.text_size_scale&&(f["--sc-text-scale"]=String(a.text_size_scale)),a.tile_bg&&(f["--sc-tile-bg"]=a.tile_bg),a.tile_bg_image&&(f["--sc-tile-bg-image"]=`url("${a.tile_bg_image}")`),a.tile_bg_image_size&&(f["--sc-tile-bg-image-sz"]="stretch"===a.tile_bg_image_size?"100% 100%":a.tile_bg_image_size),this._config.card_bg_image&&(f["--sc-card-bg-image"]=`url("${this._config.card_bg_image}")`),this._config.card_bg_image_size&&(f["--sc-card-bg-image-sz"]="stretch"===this._config.card_bg_image_size?"100% 100%":this._config.card_bg_image_size),a.tile_border&&(f["--sc-tile-border"]=a.tile_border),null!=a.tile_border_width&&(f["--sc-tile-border-width"]=`${a.tile_border_width}px`),a.tile_hover_bg&&(f["--sc-tile-hover-bg"]=a.tile_hover_bg),a.tile_hover_shadow&&(f["--sc-tile-hover-shad"]=a.tile_hover_shadow),a.tile_sensor_bg&&(f["--sc-sensor-bg"]=a.tile_sensor_bg),a.tile_exp_bg&&(f["--sc-tile-exp-bg"]=a.tile_exp_bg),null!=a.card_radius&&(f["--sc-card-radius"]=`${a.card_radius}px`),a.text_primary&&(f["--sc-text-primary"]=a.text_primary),a.text_secondary&&(f["--sc-text-secondary"]=a.text_secondary),a.text_muted&&(f["--sc-text-muted"]=a.text_muted),a.offline_color&&(f["--sc-offline-dot"]=a.offline_color),a.online_color&&(f["--sc-online-color"]=a.online_color),a.power_color&&(f["--sc-power-color"]=a.power_color),a.area_header_color&&(f["--sc-area-header-color"]=a.area_header_color),this._config.graph_line_color&&(f["--sc-graph-line"]=this._config.graph_line_color);a.tile_box_shadow&&"none"!==a.tile_box_shadow?f["--sc-tile-shadow"]={soft:"0 2px 8px rgba(0,0,0,0.25)",medium:"0 4px 16px rgba(0,0,0,0.40)",strong:"0 8px 28px rgba(0,0,0,0.60)"}[a.tile_box_shadow]??"none":"none"===a.tile_box_shadow&&(f["--sc-tile-shadow"]="none");const v=a.button_shape??"pill",b=a.button_variant??"fill",m=a.button_size??"md",x={sm:"2px 8px",md:"4px 11px",lg:"6px 16px"},y={sm:"3px 5px",md:"4px 8px",lg:"6px 12px"},_="square"===v||"circle"===v;f["--tog-radius"]="pill"===v?"20px":"rect"===v||"square"===v?"6px":"50%",f["--tog-pad"]=_?y[m]??y.md:x[m]??x.md,f["--tog-fsize"]="sm"===m?".65em":"lg"===m?".8em":".72em",f["--tog-aspect"]=_?"1":"auto","outline"===b?(f["--tog-on-bg"]="transparent",f["--tog-on-border"]="1px solid var(--sc-accent)",f["--tog-on-color"]="var(--sc-accent)",f["--tog-on-shadow"]="none"):"ghost"===b&&(f["--tog-on-bg"]="transparent",f["--tog-on-border"]="none",f["--tog-on-color"]="var(--sc-accent)",f["--tog-on-shadow"]="none"),a.header_bg&&a.header_bg2?f["--sc-header-bg"]=`linear-gradient(135deg, ${a.header_bg} 0%, ${a.header_bg2} 100%)`:a.header_bg&&(f["--sc-header-bg"]=a.header_bg),a.header_text_color&&(f["--sc-header-text"]=a.header_text_color),a.header_orb_color&&(f["--sc-header-orb2"]=a.header_orb_color),void 0!==a.header_icon&&(f["--sc-header-icon"]=`'${a.header_icon}'`),a.header_title_size&&(f["--sc-header-title-size"]=`${a.header_title_size}em`),null!=a.header_radius&&(f["--sc-header-radius"]=`${a.header_radius}px`),null!=a.header_padding&&(f["--sc-header-padding"]=`${a.header_padding}px`),a.header_border_color&&(f["--sc-header-border-color"]=a.header_border_color),null!=a.header_border_width&&(f["--sc-header-border-width"]=`${a.header_border_width}px`),a.header_stat_online&&(f["--sc-hstat-online"]=a.header_stat_online),a.header_stat_power&&(f["--sc-hstat-power"]=a.header_stat_power),a.header_stat_offline&&(f["--sc-hstat-offline"]=a.header_stat_offline),!1===this._config.header_show_orbs&&(f["--sc-header-orb-opacity"]="0");const w=this._config.header_opacity??100;w<100&&(f["--sc-header-opacity"]=String(w/100));const $=a.card_bg??"var(--ha-card-background, #1c1c1e)";a.card_bg&&(f["--sc-card-bg"]=a.card_bg);const k=this._config.card_opacity??100;k<100&&(f["--sc-card-bg"]=`color-mix(in srgb, ${$} ${k}%, transparent)`);const C=this._config.tile_opacity??100;return C<100&&(f["--sc-tile-bg-opacity"]=String(C/100)),V`
      <ha-card style=${ye(f)} @click=${()=>{this._cloudDetailOpen&&(this._cloudDetailOpen=null)}}>
        ${this._renderGraphDialog()}
        <div class="dash-header">
          <div class="dash-header-bg"></div>
          ${!1!==this._config.header_show_title?V`
            <span class="dash-title">${this._config.title??"Shelly"}</span>`:q}
          ${!1!==this._config.header_show_stats?V`
            <div class="dash-stats">
              <span class="stat online">${r}/${o.length} online</span>
              ${n>0?V`<span class="stat offline-count">${n} offline</span>`:q}
              <span class="stat power">${Se(s)}</span>
              ${l.length>0?V`<span class="stat alerts-count">⚠ ${l.length}</span>`:q}
            </div>`:q}
          ${!1!==this._config.header_show_cloud?V`
            <div class="cloud-chips">
              <span class="cloud-chip cloud-on ${"on"===this._cloudDetailOpen?"active":""}"
                @click=${e=>{e.stopPropagation(),this._cloudDetailOpen="on"===this._cloudDetailOpen?null:"on"}}>
                ● ${p.length} online</span>
              <span class="cloud-chip cloud-off ${"off"===this._cloudDetailOpen?"active":""}"
                @click=${e=>{e.stopPropagation(),this._cloudDetailOpen="off"===this._cloudDetailOpen?null:"off"}}>
                ● ${u.length} offline</span>
              ${h.length>0?V`
                <span class="cloud-chip cloud-unavail ${"unavailable"===this._cloudDetailOpen?"active":""}"
                  @click=${e=>{e.stopPropagation(),this._cloudDetailOpen="unavailable"===this._cloudDetailOpen?null:"unavailable"}}>
                  ● ${h.length} unavailable</span>`:q}
            </div>`:q}
        </div>
        ${"on"===this._cloudDetailOpen?V`
          <div class="cloud-detail" @click=${e=>e.stopPropagation()}>
            <div class="cloud-detail-hdr cloud-on">● Online — ${p.length} devices</div>
            <div class="cloud-grid">
              ${p.map(e=>V`<div class="cloud-item">${g(e)}</div>`)}
            </div>
          </div>`:q}
        ${"off"===this._cloudDetailOpen?V`
          <div class="cloud-detail" @click=${e=>e.stopPropagation()}>
            <div class="cloud-detail-hdr cloud-off">● Offline — ${u.length} devices</div>
            <div class="cloud-grid">
              ${u.map(e=>V`<div class="cloud-item">${g(e)}</div>`)}
            </div>
          </div>`:q}
        ${"unavailable"===this._cloudDetailOpen?V`
          <div class="cloud-detail" @click=${e=>e.stopPropagation()}>
            <div class="cloud-detail-hdr cloud-unavail">● Unavailable — ${h.length} devices</div>
            <div class="cloud-grid">
              ${h.map(e=>V`<div class="cloud-item">${g(e)}</div>`)}
            </div>
          </div>`:q}
        <div class="dash-body">
          ${[...c.entries()].map(([e,t])=>this._renderAreaSection(e,t))}
        </div>
      </ha-card>
    `}};var Ye,Ze;qe.BRIGHTNESS_MAX=255,qe.styles=n`
    :host {
      --sc-accent:          #f4601e;
      --sc-accent-glow:     rgba(244,96,30,0.35);
      --sc-graph-line:      var(--sc-accent);
      --tile-radius:        12px;
      --tile-gap:           10px;
      --sc-header-bg:       linear-gradient(135deg,#1a1a2e 0%,#16213e 50%,#0f3460 100%);
      --sc-header-orb2:     #3b82f6;
      --sc-header-text:     #ffffff;
      --sc-online-color:    #4ade80;
      --sc-online-bg:       rgba(74,222,128,0.2);
      --sc-online-border:   rgba(74,222,128,0.3);
      --sc-online-glow:     rgba(74,222,128,0.4);
      --sc-power-color:     #fb923c;
      --sc-offline-dot:     #ef4444;
      --sc-tile-bg:         rgba(255,255,255,0.04);
      --sc-tile-bg-image:   none;
      --sc-tile-bg-image-sz:cover;
      --sc-tile-border:     rgba(255,255,255,0.07);
      --sc-tile-hover-bg:   rgba(255,255,255,0.07);
      --sc-tile-hover-shad: rgba(0,0,0,0.30);
      --sc-tile-exp-bg:     rgba(255,255,255,0.06);
      --sc-sensor-bg:       rgba(255,255,255,0.04);
      --sc-text-primary:    #e5e7eb;
      --sc-text-secondary:  #9ca3af;
      --sc-text-muted:      #6b7280;
      --sc-text-value:      #f9fafb;
      --sc-text-detail:     #d1d5db;
      --sc-tog-off-bg:      rgba(255,255,255,0.08);
      --sc-tog-off-border:  rgba(255,255,255,0.10);
      --sc-update-color:    #f59e0b;
      --sc-update-glow:     rgba(245,158,11,0.40);
      --sc-font-family:     'DM Sans', sans-serif;
      --sc-text-transform:  uppercase;
      --sc-text-scale:      1;
      --sc-card-bg:         var(--ha-card-background, var(--card-background-color, #1c1c1e));
      --sc-card-bg-image:   none;
      --sc-card-bg-image-sz:cover;
      --sc-tile-bg-opacity:      1;
      --sc-header-opacity:       1;
      --sc-header-orb-opacity:   0.5;
      --sc-header-radius:        0px;
      --sc-header-padding:       16px;
      --sc-header-title-size:    1.1em;
      --sc-header-icon:          '⚡';
      --sc-header-border-width:  0px;
      --sc-header-border-color:  transparent;
      --sc-tile-border-width:    1px;
      --sc-tile-shadow:          none;
      --sc-card-radius:          var(--ha-card-border-radius, 12px);
      --sc-area-header-color:    var(--sc-accent);
    }

    ha-card {
      overflow-x: hidden; overflow-y: visible;
      background: var(--sc-card-bg-image) center / var(--sc-card-bg-image-sz) no-repeat, var(--sc-card-bg);
      container-type: inline-size; container-name: ha-dash;
      font-family: var(--sc-font-family);
      border-radius: var(--sc-card-radius);
    }

    .dash-header {
      position: relative; display: flex; align-items: center; gap:10px;
      padding: var(--sc-header-padding, 16px) 18px; overflow: hidden;
      border-radius: var(--sc-header-radius, 0px);
      border-bottom: var(--sc-header-border-width, 0px) solid var(--sc-header-border-color, transparent);
    }
    .dash-header-bg {
      position: absolute; inset: 0; background: var(--sc-header-bg);
      opacity: var(--sc-header-opacity, 1); pointer-events: none; z-index: 0;
    }
    .dash-stats { margin-right: auto; }
    .dash-header::before,.dash-header::after {
      content:''; position:absolute; border-radius:50%; filter:blur(40px);
      opacity: var(--sc-header-orb-opacity, 0.5);
      animation: drift 8s ease-in-out infinite alternate;
    }
    .dash-header::before { width:120px;height:120px; background:var(--sc-accent); top:-40px;left:-20px; }
    .dash-header::after  { width:100px;height:100px; background:var(--sc-header-orb2); bottom:-30px;right:20px; animation-delay:-4s; }
    @keyframes drift { from{transform:translate(0,0) scale(1)} to{transform:translate(15px,8px) scale(1.15)} }

    .dash-title {
      font-size: var(--sc-header-title-size, 1.1em); font-weight:800; color:var(--sc-header-text);
      letter-spacing:0.02em; position:relative; z-index:1;
      display:flex; align-items:center; gap:8px;
    }
    .dash-title::before { content: var(--sc-header-icon, '⚡'); }

    .dash-stats { display:flex; gap:8px; align-items:center; position:relative; z-index:1; flex-shrink:0; }
    .stat { font-size:0.78em; padding:3px 10px; border-radius:20px; font-weight:600; backdrop-filter:blur(4px); }
    .stat.online   { background:var(--sc-online-bg);  color:var(--sc-online-color); border:1px solid var(--sc-online-border); }
    .stat.power    { background:color-mix(in srgb,var(--sc-accent) 20%,transparent); color:var(--sc-power-color); border:1px solid color-mix(in srgb,var(--sc-accent) 30%,transparent); }
    .stat.offline-count { background:rgba(75,85,99,.25); color:#9ca3af; border:1px solid rgba(75,85,99,.35); }
    .stat.alerts-count  { background:rgba(239,68,68,.2); color:#fca5a5; border:1px solid rgba(239,68,68,.3); animation:blink 2s step-end infinite; }
    /* Scoped header stat chip color overrides */
    .dash-header .stat.online       { color:var(--sc-hstat-online, var(--sc-online-color)); background:color-mix(in srgb,var(--sc-hstat-online, var(--sc-online-color)) 18%,transparent); border-color:color-mix(in srgb,var(--sc-hstat-online, var(--sc-online-color)) 30%,transparent); }
    .dash-header .stat.power        { color:var(--sc-hstat-power, var(--sc-power-color)); }
    .dash-header .stat.offline-count { color:var(--sc-hstat-offline, #9ca3af); }

    /* ── Cloud status chips ── */
    .cloud-chips { display:flex; gap:5px; align-items:center; position:relative; z-index:1; flex-shrink:0; }
    .cloud-chip { font-size:0.72em; font-weight:700; padding:3px 10px; border-radius:20px; backdrop-filter:blur(4px); cursor:pointer; transition:all .15s; white-space:nowrap; }
    .cloud-chip:hover { opacity:.8; }
    .cloud-chip.cloud-on    { background:rgba(74,222,128,.18); color:#4ade80; border:1px solid rgba(74,222,128,.3); }
    .cloud-chip.cloud-off   { background:rgba(239,68,68,.18);  color:#f87171; border:1px solid rgba(239,68,68,.3); }
    .cloud-chip.cloud-unavail { background:rgba(107,114,128,.2); color:#9ca3af; border:1px solid rgba(107,114,128,.3); }
    .cloud-chip.active { filter:brightness(1.3); box-shadow:0 0 8px currentColor; }

    /* ── Cloud detail panel ── */
    .cloud-detail { padding:12px 18px 14px; background:rgba(0,0,0,.3); border-bottom:1px solid rgba(255,255,255,.06); animation:slide-in .15s ease; }
    .cloud-detail-hdr { font-size:.7em; font-weight:700; text-transform:uppercase; letter-spacing:.06em; margin-bottom:10px; padding-bottom:6px; border-bottom:1px solid rgba(255,255,255,.08); }
    .cloud-detail-hdr.cloud-on    { color:#4ade80; }
    .cloud-detail-hdr.cloud-off   { color:#f87171; }
    .cloud-detail-hdr.cloud-unavail { color:#9ca3af; }
    .cloud-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(180px,1fr)); gap:4px 16px; }
    .cloud-item { font-size:.82em; color:var(--sc-text-secondary); padding:3px 0; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }

    .dash-body { padding:0 0 8px; }
    .empty { padding:32px; text-align:center; color:var(--secondary-text-color); }
    .empty .hint { font-size:.85em; margin-top:4px; }

    .area-section {
      position:relative; overflow:hidden; margin:6px 10px 2px;
      border:1px solid var(--sc-tile-border); border-radius:10px;
    }
    .area-header {
      display:flex; align-items:center; justify-content:space-between;
      background:var(--area-header-bg,rgba(255,255,255,0.04));
      padding:8px 14px; cursor:pointer; user-select:none;
      border-radius:10px; transition:filter 0.15s;
    }
    .area-header:hover { filter:brightness(1.08); }
    .area-section:not(.closed) .area-header { border-radius:10px 10px 0 0; border-bottom:1px solid var(--sc-tile-border); }
    .area-name { font-size:var(--area-name-size,0.78em); font-weight:var(--area-name-weight,700); text-transform:var(--sc-text-transform,uppercase); letter-spacing:0.08em; color:var(--area-header-color,var(--sc-area-header-color,var(--sc-accent))); }
    .area-chips { display:flex; align-items:center; flex-wrap:wrap; gap:4px; flex:1; margin:0 10px; }
    .area-chip { display:flex; align-items:center; gap:3px; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.08); border-radius:4px; padding:1px 5px; }
    .area-chip .tsc-lbl { font-size:.65em; color:var(--secondary-text-color); }
    .area-chip .tsc-val { font-size:.72em; font-weight:600; color:var(--sc-text-primary,var(--primary-text-color)); }
    .area-meta { display:flex; align-items:center; gap:8px; }
    .area-count { font-size:.75em; color:var(--secondary-text-color); }
    .area-power { font-size:.78em; font-weight:600; color:var(--sc-power-color); }
    .chevron { font-size:.6em; color:var(--secondary-text-color); transition:transform 0.25s; display:inline-block; }
    .chevron.open { transform:rotate(180deg); }

    .device-grid {
      display:grid; grid-template-columns:repeat(var(--cols,3),1fr);
      gap:var(--tile-gap,10px); padding:4px 12px 14px;
    }
    @container ha-dash (max-width:600px) { .device-grid { --cols:2; } }
    @container ha-dash (max-width:380px) { .device-grid { --cols:1; } }
    @container ha-dash (min-width:700px) { .sparkline-svg.exp { height:56px; } }

    .tile {
      border: var(--sc-tile-border-width, 1px) solid var(--sc-tile-border);
      border-radius:var(--tile-radius); padding:11px 13px; cursor:pointer;
      transition:transform 0.15s, box-shadow 0.15s;
      display:flex; flex-direction:column; gap:6px; position:relative; overflow:hidden;
      isolation:isolate; box-shadow: var(--sc-tile-shadow, none);
    }
    .tile::after {
      content:''; position:absolute; inset:0; z-index:-1; pointer-events:none;
      background:var(--sc-tile-bg);
      background-image:var(--sc-tile-bg-image); background-size:var(--sc-tile-bg-image-sz); background-position:center;
      opacity:var(--sc-tile-bg-opacity,1); transition:opacity 0.15s, background 0.15s;
    }
    .tile::before {
      content:''; position:absolute; top:0;left:0;right:0; height:2px;
      background:linear-gradient(90deg,var(--sc-accent),transparent); opacity:0; transition:opacity 0.2s; z-index:1;
    }
    .tile:hover { transform:translateY(-2px); box-shadow:0 6px 20px var(--sc-tile-hover-shad); }
    .tile:hover::after { background-color:var(--sc-tile-hover-bg); }
    .tile:hover::before { opacity:1; }
    .tile.offline { opacity:.45; filter:grayscale(.4); }
    .tile.expanded { border-color:var(--sc-accent); box-shadow:0 0 0 1px var(--sc-accent),0 4px 12px var(--sc-accent-glow); transform:none; }
    .tile.expanded::after { background-color:var(--sc-tile-exp-bg); }
    .tile.expanded::before { opacity:1; }
    .tile.tile-sm { padding:7px 9px; gap:4px; }
    .tile.tile-lg { padding:15px 17px; gap:9px; }

    .tile-expanded-panel {
      grid-column:1/-1; margin:2px 4px 6px; padding:14px;
      border:1px solid var(--sc-accent); border-radius:8px;
      background:var(--sc-tile-exp-bg);
      box-shadow:0 0 0 1px var(--sc-accent),0 8px 24px var(--sc-accent-glow);
      animation:slide-in 0.2s ease; cursor:default;
    }
    @keyframes slide-in { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }

    .tile-top { display:flex; align-items:center; justify-content:space-between; gap:6px; min-width:0; }
    .tile-left { display:flex; align-items:center; gap:6px; min-width:0; flex:1; }

    .dot { width:8px; height:8px; border-radius:50%; flex-shrink:0; }
    .dot.online { background:var(--sc-online-color); box-shadow:0 0 0 0 var(--sc-online-glow); animation:pulse-dot 2.5s ease-in-out infinite; }
    .dot.offline { background:var(--sc-offline-dot); }
    @keyframes pulse-dot { 0%{box-shadow:0 0 0 0 var(--sc-online-glow)} 60%{box-shadow:0 0 0 5px transparent} 100%{box-shadow:0 0 0 0 var(--sc-online-glow)} }

    .tile-name { font-size:calc(var(--sc-text-scale,1) * .88em); font-weight:600; color:var(--sc-text-primary); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; min-width:0; }
    .update-dot { color:var(--sc-update-color); font-size:.55em; flex-shrink:0; animation:blink 2s step-end infinite; }
    @keyframes blink { 50%{opacity:.3} }

    /* ── Tile icons ── */
    .tile-icon { width:18px; height:18px; flex-shrink:0; color:var(--sc-text-muted); transition:color .3s, filter .3s; }

    /* Relay / plug — lightning bolt */
    .tile-icon-relay.on { color:var(--sc-accent); animation:icon-pulse 2s ease-in-out infinite; }
    @keyframes icon-pulse { 0%,100%{filter:drop-shadow(0 0 3px var(--ipglow,var(--sc-accent-glow)))} 50%{filter:drop-shadow(0 0 8px var(--ipglow,var(--sc-accent-glow)))} }

    /* Fan — spinning blades */
    .tile-icon-fan .fan-blades { transform-origin:10px 10px; }
    .tile-icon-fan.on { color:var(--sc-accent); }
    .tile-icon-fan.on .fan-blades { animation:fan-spin 1s linear infinite; }
    @keyframes fan-spin { to{transform:rotate(360deg)} }

    /* Sun — rotate + glow */
    .tile-icon-sun { transform-origin:10px 10px; }
    .tile-icon-sun.on { color:#fbbf24; filter:drop-shadow(0 0 5px rgba(251,191,36,0.6)); animation:sun-spin 8s linear infinite; }
    @keyframes sun-spin { to{transform:rotate(360deg)} }

    /* Cover — slat movement */
    .tile-icon-cover.moving { animation:cover-bounce 1s ease-in-out infinite; }
    @keyframes cover-bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-1.5px)} }

    /* Flame — flicker */
    .tile-icon-flame.on { color:#f97316; filter:drop-shadow(0 0 5px rgba(249,115,22,0.6)); }
    .tile-icon-flame.on .flame-main { animation:flicker 1.5s ease-in-out infinite alternate; transform-origin:10px 18px; }
    .tile-icon-flame.on .flame-inner { animation:flicker 1.5s ease-in-out infinite alternate-reverse; transform-origin:10px 18px; }
    @keyframes flicker { 0%{transform:scaleX(1) scaleY(1)} 33%{transform:scaleX(.95) scaleY(1.04)} 66%{transform:scaleX(1.04) scaleY(.97)} 100%{transform:scaleX(.97) scaleY(1.03)} }

    /* Valve — drip pulse */
    .tile-icon-valve.on { color:#38bdf8; filter:drop-shadow(0 0 4px rgba(56,189,248,0.5)); }
    .tile-icon-valve.on .drop-body { animation:drip 2s ease-in-out infinite; transform-origin:10px 10px; }
    @keyframes drip { 0%,100%{transform:scaleY(1)} 50%{transform:scaleY(1.06) translateY(1px)} }

    /* Energy — wave scroll */
    .tile-icon-energy { color:var(--sc-accent); }
    .tile-icon-energy .energy-wave { stroke-dasharray:40; animation:wave-scroll 2s linear infinite; }
    @keyframes wave-scroll { to{stroke-dashoffset:-40} }

    /* Input — ripple */
    .tile-icon-input.on { color:var(--sc-accent); }
    .tile-icon-input.on .input-ripple { animation:input-ripple .8s ease-out forwards; }
    @keyframes input-ripple { 0%{r:0;opacity:.8} 100%{r:6;opacity:0} }

    /* ── Entity-level state animation icons ─────────────────────────────── */
    .ent-icon { width:15px; height:15px; flex-shrink:0; transition:color .3s,filter .3s; }
    .ent-icon-flame.off { color:#4b5563; }
    .ent-icon-flame.on  { color:#f97316; filter:drop-shadow(0 0 5px rgba(249,115,22,0.55)); }
    .ent-icon-flame.on .flame-main { animation:flicker calc(1.5s / var(--ent-spd,1)) ease-in-out infinite alternate; transform-origin:10px 18px; }
    .ent-icon-flame.on .flame-inner { animation:flicker calc(1.5s / var(--ent-spd,1)) ease-in-out infinite alternate-reverse; transform-origin:10px 18px; }
    .ent-icon-snowflake { color:#7dd3fc; }
    .ent-icon-snowflake .snow-arms { animation:snow-spin calc(6s / var(--ent-spd,1)) linear infinite; }
    @keyframes snow-spin { to { transform:rotate(360deg); } }
    .ent-icon-fan.off { color:#4b5563; }
    .ent-icon-fan.on  { color:var(--sc-accent); }
    .ent-icon-fan.on .fan-blades { animation:fan-spin calc(1s / var(--ent-spd,1)) linear infinite; }
    .ent-icon-pulse.off { color:#4b5563; }
    .ent-icon-pulse.on  { color:var(--sc-accent); }
    .ent-icon-pulse.on .pulse-ring { animation:icon-pulse calc(2s / var(--ent-spd,1)) ease-in-out infinite; transform-origin:10px 10px; }
    .ent-icon-wave { color:var(--sc-accent); }
    .ent-icon-wave .energy-wave { stroke-dasharray:40; animation:wave-scroll calc(2s / var(--ent-spd,1)) linear infinite; }
    .ent-icon-sun.off { color:#4b5563; }
    .ent-icon-sun.on  { color:#fbbf24; filter:drop-shadow(0 0 6px rgba(251,191,36,0.55)); }
    .ent-icon-sun.on .sun-group { animation:snow-spin calc(8s / var(--ent-spd,1)) linear infinite; }
    .ent-icon-lightning.off { color:#4b5563; }
    .ent-icon-lightning.on  { --ipglow:rgba(251,191,36,0.55); color:#fbbf24; animation:icon-pulse calc(1.5s / var(--ent-spd,1)) ease-in-out infinite; }
    .ent-icon-heart.off { color:#4b5563; }
    .ent-icon-heart.on  { color:#f43f5e; filter:drop-shadow(0 0 5px rgba(244,63,94,0.55)); }
    .ent-icon-heart.on .heart-shape { animation:heartbeat calc(1s / var(--ent-spd,1)) ease-in-out infinite; transform-origin:10px 10px; }
    @keyframes heartbeat { 0%,100%{transform:scale(1)} 20%{transform:scale(1.22)} 40%{transform:scale(1)} 60%{transform:scale(1.15)} }
    .ent-icon-bulb.off { color:#6b7280; }
    .ent-icon-bulb.off .bulb-body { fill:none; stroke:currentColor; stroke-width:1.2; opacity:0.6; }
    .ent-icon-bulb.off .bulb-base1,.ent-icon-bulb.off .bulb-base2 { opacity:0.3; }
    .ent-icon-bulb.on  { --ipglow:rgba(253,224,71,0.65); color:#fde047; animation:icon-pulse calc(2.5s / var(--ent-spd,1)) ease-in-out infinite; }
    .ent-icon-leaf.off { color:#4b5563; }
    .ent-icon-leaf.on  { color:#4ade80; filter:drop-shadow(0 0 5px rgba(74,222,128,0.5)); }
    .ent-icon-leaf.on .leaf-body { animation:leaf-sway calc(3s / var(--ent-spd,1)) ease-in-out infinite; transform-origin:10px 17px; }
    @keyframes leaf-sway { 0%,100%{transform:rotate(0deg)} 33%{transform:rotate(6deg)} 66%{transform:rotate(-6deg)} }
    .ent-icon-moon.off { color:#4b5563; }
    .ent-icon-moon.on  { --ipglow:rgba(196,181,253,0.55); color:#c4b5fd; animation:icon-pulse calc(3s / var(--ent-spd,1)) ease-in-out infinite; }
    .ent-icon-water.off { color:#4b5563; }
    .ent-icon-water.on  { color:#38bdf8; filter:drop-shadow(0 0 5px rgba(56,189,248,0.5)); }
    .ent-icon-water.on .drop-body { animation:drip calc(2s / var(--ent-spd,1)) ease-in-out infinite; transform-origin:10px 10px; }
    .ent-icon-lock.off { color:#4b5563; }
    .ent-icon-lock.on  { --ipglow:rgba(167,139,250,0.55); color:#a78bfa; animation:icon-pulse calc(2s / var(--ent-spd,1)) ease-in-out infinite; }
    /* ── Flame variants ── */
    .ent-icon-flame2.off,.ent-icon-flame3.off { color:#4b5563; }
    .ent-icon-flame2.on  { color:#f97316; filter:drop-shadow(0 0 6px rgba(249,115,22,0.55)); }
    .ent-icon-flame2.on .flame-main { animation:flicker calc(1.5s / var(--ent-spd,1)) ease-in-out infinite alternate; transform-origin:10px 18px; }
    .ent-icon-flame2.on .flame-b { animation:flicker calc(1.5s / var(--ent-spd,1)) ease-in-out infinite alternate-reverse; transform-origin:10px 18px; animation-delay:calc(-0.4s / var(--ent-spd,1)); }
    .ent-icon-flame3.on  { color:#f97316; filter:drop-shadow(0 0 5px rgba(249,115,22,0.5)); }
    .ent-icon-flame3.on .flame-main { animation:flicker calc(1.2s / var(--ent-spd,1)) ease-in-out infinite alternate; transform-origin:10px 15px; }
    /* ── Snowflake variants ── */
    .ent-icon-snowflake2 { color:#7dd3fc; }
    .ent-icon-snowflake2 .snow-arms { animation:snow-spin calc(8s / var(--ent-spd,1)) linear infinite; }
    .ent-icon-snowflake3 { color:#7dd3fc; }
    .ent-icon-snowflake3 .snow-drift-g { animation:snow-drift calc(4s / var(--ent-spd,1)) ease-in-out infinite; }
    @keyframes snow-drift { 0%{transform:translateY(-3px) rotate(0deg)} 50%{transform:translateY(3px) rotate(180deg)} 100%{transform:translateY(-3px) rotate(360deg)} }
    /* ── Fan variants ── */
    .ent-icon-fan2.off,.ent-icon-fan3.off { color:#4b5563; }
    .ent-icon-fan2.on  { color:var(--sc-accent); }
    .ent-icon-fan2.on .fan-blades { animation:fan-spin calc(0.8s / var(--ent-spd,1)) linear infinite; }
    .ent-icon-fan3.on  { color:var(--sc-accent); }
    .ent-icon-fan3.on .fan-blades { animation:fan-spin calc(1.2s / var(--ent-spd,1)) linear infinite; }
    /* ── Lightning variants ── */
    .ent-icon-lightning2.off,.ent-icon-lightning3.off { color:#4b5563; }
    .ent-icon-lightning2.on { --ipglow:rgba(251,191,36,0.6); color:#fbbf24; filter:drop-shadow(0 0 5px rgba(251,191,36,0.5)); }
    .ent-icon-lightning2.on .bolt-a { animation:bolt-flash calc(1.2s / var(--ent-spd,1)) ease-in-out infinite; }
    .ent-icon-lightning2.on .bolt-b { animation:bolt-flash calc(1.2s / var(--ent-spd,1)) ease-in-out infinite; animation-delay:calc(-0.6s / var(--ent-spd,1)); }
    @keyframes bolt-flash { 0%,100%{opacity:1} 50%{opacity:0.2} }
    .ent-icon-lightning3.off .arc-path { opacity:0.2; }
    .ent-icon-lightning3.on  { color:#fbbf24; filter:drop-shadow(0 0 6px rgba(251,191,36,0.6)); }
    .ent-icon-lightning3.on .arc-path { animation:arc-flash calc(0.8s / var(--ent-spd,1)) ease-in-out infinite; }
    @keyframes arc-flash { 0%,100%{opacity:0.15} 50%{opacity:1} }
    /* ── Bulb variants ── */
    .ent-icon-bulb2.off { color:#6b7280; }
    .ent-icon-bulb2.off .bulb-body { fill:none; stroke:currentColor; stroke-width:1.2; opacity:0.6; }
    .ent-icon-bulb2.off .bulb-filament { display:none; }
    .ent-icon-bulb2.off .bulb-base1,.ent-icon-bulb2.off .bulb-base2 { opacity:0.3; }
    .ent-icon-bulb2.on { --ipglow:rgba(251,191,36,0.7); color:#fbbf24; animation:icon-pulse calc(2.5s / var(--ent-spd,1)) ease-in-out infinite; }
    .ent-icon-bulb3.off { color:#6b7280; }
    .ent-icon-bulb3.off .bulb-chip { fill:none; stroke:currentColor; stroke-width:1; opacity:0.5; }
    .ent-icon-bulb3.on { --ipglow:rgba(224,242,254,0.7); color:#e0f2fe; animation:icon-pulse calc(2s / var(--ent-spd,1)) ease-in-out infinite; }
    /* ── Water variants ── */
    .ent-icon-water2 { color:#38bdf8; }
    .ent-icon-water2 .wave-a { animation:wave-scroll calc(2s / var(--ent-spd,1)) linear infinite; }
    .ent-icon-water2 .wave-b { animation:wave-scroll calc(2s / var(--ent-spd,1)) linear infinite; animation-delay:calc(-0.5s / var(--ent-spd,1)); }
    .ent-icon-water3.off { color:#4b5563; }
    .ent-icon-water3.on  { --ipglow:rgba(56,189,248,0.5); color:#38bdf8; }
    .ent-icon-water3.on .ripple1 { animation:ripple-out calc(2s / var(--ent-spd,1)) ease-out infinite; }
    .ent-icon-water3.on .ripple2 { animation:ripple-out calc(2s / var(--ent-spd,1)) ease-out infinite; animation-delay:calc(-1s / var(--ent-spd,1)); }
    @keyframes ripple-out { 0%{r:2;opacity:0.8} 100%{r:9;opacity:0} }
    /* ── Sun variants ── */
    .ent-icon-sun2.off,.ent-icon-sun3.off { color:#4b5563; }
    .ent-icon-sun2.on { --ipglow:rgba(251,191,36,0.5); color:#fbbf24; animation:icon-pulse calc(3s / var(--ent-spd,1)) ease-in-out infinite; }
    .ent-icon-sun3.on { color:#fbbf24; filter:drop-shadow(0 0 6px rgba(251,191,36,0.55)); }
    .ent-icon-sun3.on .sun-group { animation:snow-spin calc(4s / var(--ent-spd,1)) linear infinite; }
    /* ── Moon variants ── */
    .ent-icon-moon2.off,.ent-icon-moon3.off { color:#4b5563; }
    .ent-icon-moon2.on { --ipglow:rgba(241,245,249,0.6); color:#f1f5f9; animation:icon-pulse calc(3s / var(--ent-spd,1)) ease-in-out infinite; }
    .ent-icon-moon3.on { color:#c4b5fd; filter:drop-shadow(0 0 6px rgba(196,181,253,0.55)); }
    .ent-icon-moon3.on .star1 { animation:twinkle calc(2s / var(--ent-spd,1)) ease-in-out infinite; }
    .ent-icon-moon3.on .star2 { animation:twinkle calc(2s / var(--ent-spd,1)) ease-in-out infinite; animation-delay:calc(-0.7s / var(--ent-spd,1)); }
    .ent-icon-moon3.on .star3 { animation:twinkle calc(2s / var(--ent-spd,1)) ease-in-out infinite; animation-delay:calc(-1.4s / var(--ent-spd,1)); }
    @keyframes twinkle { 0%,100%{opacity:1} 50%{opacity:0.15} }
    @keyframes wind-blow { 0%{transform:translateX(0);opacity:0.3} 50%{opacity:1} 100%{transform:translateX(4px);opacity:0.3} }
    @keyframes bell-ring { 0%,100%{transform:rotate(0deg)} 20%{transform:rotate(-10deg)} 40%{transform:rotate(10deg)} 60%{transform:rotate(-7deg)} 80%{transform:rotate(7deg)} }
    @keyframes therm-pulse { 0%,100%{transform:scaleY(1)} 50%{transform:scaleY(0.65)} }
    @keyframes star-pulse { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.15);opacity:0.7} }
    @keyframes star-shoot { 0%{transform:translate(0,0);opacity:1} 100%{transform:translate(6px,-6px);opacity:0.15} }
    @keyframes ekg-scan { to{stroke-dashoffset:-50} }
    @keyframes bar-bounce { 0%,100%{transform:scaleY(0.3)} 50%{transform:scaleY(1)} }

    /* ── Wind ──────────────────────────────────────────────────── */
    .ent-icon-wind.off,.ent-icon-wind2.off,.ent-icon-wind3.off { color:#4b5563; }
    .ent-icon-wind.on  { color:#a5f3fc; filter:drop-shadow(0 0 5px rgba(165,243,252,0.45)); }
    .ent-icon-wind.on .wind-line-a { animation:wave-scroll calc(1.4s / var(--ent-spd,1)) linear infinite; stroke-dasharray:24; }
    .ent-icon-wind.on .wind-line-b { animation:wave-scroll calc(1.6s / var(--ent-spd,1)) linear infinite; stroke-dasharray:20; animation-delay:calc(-0.25s / var(--ent-spd,1)); }
    .ent-icon-wind.on .wind-line-c { animation:wave-scroll calc(1.9s / var(--ent-spd,1)) linear infinite; stroke-dasharray:16; animation-delay:calc(-0.5s / var(--ent-spd,1)); }
    .ent-icon-wind2.on { color:#a5f3fc; filter:drop-shadow(0 0 4px rgba(165,243,252,0.4)); }
    .ent-icon-wind2.on .gust-a { animation:wind-blow calc(1s / var(--ent-spd,1)) ease-in-out infinite; }
    .ent-icon-wind2.on .gust-b { animation:wind-blow calc(1s / var(--ent-spd,1)) ease-in-out infinite; animation-delay:calc(-0.33s / var(--ent-spd,1)); }
    .ent-icon-wind2.on .gust-c { animation:wind-blow calc(1s / var(--ent-spd,1)) ease-in-out infinite; animation-delay:calc(-0.66s / var(--ent-spd,1)); }
    .ent-icon-wind3.on { color:#a5f3fc; --ipglow:rgba(165,243,252,0.5); animation:icon-pulse calc(2s / var(--ent-spd,1)) ease-in-out infinite; }

    /* ── Bell ──────────────────────────────────────────────────── */
    .ent-icon-bell.off,.ent-icon-bell2.off,.ent-icon-bell3.off { color:#4b5563; }
    .ent-icon-bell.on  { color:#fde68a; --ipglow:rgba(253,230,138,0.55); filter:drop-shadow(0 0 5px rgba(253,230,138,0.4)); animation:bell-ring calc(1.2s / var(--ent-spd,1)) ease-in-out infinite; transform-origin:10px 2.5px; }
    .ent-icon-bell2.on { color:#fde68a; --ipglow:rgba(253,230,138,0.55); filter:drop-shadow(0 0 4px rgba(253,230,138,0.35)); }
    .ent-icon-bell2.on .ring-a { animation:arc-flash calc(0.8s / var(--ent-spd,1)) ease-in-out infinite; }
    .ent-icon-bell2.on .ring-b { animation:arc-flash calc(0.8s / var(--ent-spd,1)) ease-in-out infinite; animation-delay:calc(-0.25s / var(--ent-spd,1)); }
    .ent-icon-bell2.on .ring-c { animation:arc-flash calc(0.8s / var(--ent-spd,1)) ease-in-out infinite; animation-delay:calc(-0.5s / var(--ent-spd,1)); }
    .ent-icon-bell3.on { color:#fca5a5; --ipglow:rgba(252,165,165,0.55); animation:icon-pulse calc(1.2s / var(--ent-spd,1)) ease-in-out infinite; }

    /* ── Thermometer ────────────────────────────────────────────── */
    .ent-icon-thermometer.off,.ent-icon-thermometer2.off,.ent-icon-thermometer3.off { color:#4b5563; }
    .ent-icon-thermometer.on  { color:#fb923c; filter:drop-shadow(0 0 5px rgba(251,146,60,0.5)); }
    .ent-icon-thermometer.on .therm-mercury { animation:therm-pulse calc(2s / var(--ent-spd,1)) ease-in-out infinite; transform-origin:10px 13px; }
    .ent-icon-thermometer2.on { color:#f87171; filter:drop-shadow(0 0 5px rgba(248,113,113,0.5)); }
    .ent-icon-thermometer2.on .therm-arrow { animation:cover-bounce calc(1.2s / var(--ent-spd,1)) ease-in-out infinite; }
    .ent-icon-thermometer3.on { color:#fb923c; filter:drop-shadow(0 0 4px rgba(251,146,60,0.45)); }
    .ent-icon-thermometer3.on .therm-up   { animation:cover-bounce calc(1.4s / var(--ent-spd,1)) ease-in-out infinite; }
    .ent-icon-thermometer3.on .therm-down { animation:cover-bounce calc(1.4s / var(--ent-spd,1)) ease-in-out infinite; animation-delay:calc(-0.7s / var(--ent-spd,1)); }

    /* ── Battery ────────────────────────────────────────────────── */
    .ent-icon-battery.off,.ent-icon-battery2.off { color:#4b5563; }
    .ent-icon-battery.on  { color:#4ade80; --ipglow:rgba(74,222,128,0.5); animation:icon-pulse calc(2s / var(--ent-spd,1)) ease-in-out infinite; }
    .ent-icon-battery2.on { color:#fbbf24; filter:drop-shadow(0 0 5px rgba(251,191,36,0.5)); }
    .ent-icon-battery2.on .charge-bolt { animation:bolt-flash calc(0.9s / var(--ent-spd,1)) ease-in-out infinite; }
    .ent-icon-battery3      { color:#f87171; }
    .ent-icon-battery3.off  { color:#6b7280; }
    .ent-icon-battery3.on   { color:#f87171; filter:drop-shadow(0 0 4px rgba(248,113,113,0.5)); animation:blink calc(1.2s / var(--ent-spd,1)) step-end infinite; }

    /* ── Star ───────────────────────────────────────────────────── */
    .ent-icon-star.off,.ent-icon-star2.off,.ent-icon-star3.off { color:#4b5563; }
    .ent-icon-star.on  { color:#fde047; --ipglow:rgba(253,224,71,0.55); filter:drop-shadow(0 0 6px rgba(253,224,71,0.45)); animation:star-pulse calc(2s / var(--ent-spd,1)) ease-in-out infinite; transform-origin:10px 10px; }
    .ent-icon-star2.on { color:#fde047; filter:drop-shadow(0 0 5px rgba(253,224,71,0.4)); }
    .ent-icon-star2.on .star-body { animation:fan-spin calc(3s / var(--ent-spd,1)) linear infinite; transform-origin:10px 10px; }
    .ent-icon-star3.on { color:#fde047; filter:drop-shadow(0 0 4px rgba(253,224,71,0.4)); animation:star-shoot calc(1.5s / var(--ent-spd,1)) ease-in-out infinite alternate; }

    /* ── Pulse variants ─────────────────────────────────────────── */
    .ent-icon-pulse2.off,.ent-icon-pulse3.off { color:#4b5563; }
    .ent-icon-pulse2.on { color:var(--sc-accent); }
    .ent-icon-pulse2.on .pulse-ring  { animation:ripple-out calc(1.2s / var(--ent-spd,1)) ease-out infinite; }
    .ent-icon-pulse2.on .pulse-ring2 { animation:ripple-out calc(1.2s / var(--ent-spd,1)) ease-out infinite; animation-delay:calc(-0.5s / var(--ent-spd,1)); }
    .ent-icon-pulse3.on { color:#f43f5e; filter:drop-shadow(0 0 4px rgba(244,63,94,0.45)); }
    .ent-icon-pulse3.on .ekg-line { animation:ekg-scan calc(1.5s / var(--ent-spd,1)) linear infinite; stroke-dasharray:50; stroke-dashoffset:0; }

    /* ── Wave variants ──────────────────────────────────────────── */
    .ent-icon-wave2.off,.ent-icon-wave3.off,.ent-icon-wave4.off { color:#4b5563; }
    .ent-icon-wave2.on { color:#5eead4; filter:drop-shadow(0 0 4px rgba(94,234,212,0.4)); }
    .ent-icon-wave2.on .bar-odd  { animation:bar-bounce calc(0.6s / var(--ent-spd,1)) ease-in-out infinite alternate; transform-origin:50% 100%; }
    .ent-icon-wave2.on .bar-even { animation:bar-bounce calc(0.6s / var(--ent-spd,1)) ease-in-out infinite alternate-reverse; transform-origin:50% 100%; }
    .ent-icon-wave3.on { color:#7dd3fc; filter:drop-shadow(0 0 4px rgba(125,211,252,0.4)); }
    .ent-icon-wave3.on .arc-a { animation:twinkle calc(1.5s / var(--ent-spd,1)) ease-in-out infinite; }
    .ent-icon-wave3.on .arc-b { animation:twinkle calc(1.5s / var(--ent-spd,1)) ease-in-out infinite; animation-delay:calc(-0.5s / var(--ent-spd,1)); }
    .ent-icon-wave3.on .arc-c { animation:twinkle calc(1.5s / var(--ent-spd,1)) ease-in-out infinite; animation-delay:calc(-1s / var(--ent-spd,1)); }
    .ent-icon-wave4.on { color:#93c5fd; filter:drop-shadow(0 0 4px rgba(147,197,253,0.4)); }
    .ent-icon-wave4.on .wifi-a { animation:twinkle calc(1.4s / var(--ent-spd,1)) ease-in-out infinite; }
    .ent-icon-wave4.on .wifi-b { animation:twinkle calc(1.4s / var(--ent-spd,1)) ease-in-out infinite; animation-delay:calc(-0.45s / var(--ent-spd,1)); }
    .ent-icon-wave4.on .wifi-c { animation:twinkle calc(1.4s / var(--ent-spd,1)) ease-in-out infinite; animation-delay:calc(-0.9s / var(--ent-spd,1)); }

    /* ── Heart variant ──────────────────────────────────────────── */
    .ent-icon-heart2.off { color:#4b5563; }
    .ent-icon-heart2.on  { color:#f43f5e; filter:drop-shadow(0 0 5px rgba(244,63,94,0.5)); }
    .ent-icon-heart2.on .heart-shape { animation:heartbeat calc(0.8s / var(--ent-spd,1)) ease-in-out infinite; transform-origin:10px 10px; }

    /* ── Leaf variant ───────────────────────────────────────────── */
    .ent-icon-leaf2.off { color:#4b5563; }
    .ent-icon-leaf2.on  { color:#4ade80; filter:drop-shadow(0 0 5px rgba(74,222,128,0.45)); animation:leaf-sway calc(2.5s / var(--ent-spd,1)) ease-in-out infinite; transform-origin:10px 18px; }

    /* ── Lock variant ───────────────────────────────────────────── */
    .ent-icon-lock2.off { color:#4b5563; }
    .ent-icon-lock2.on  { color:#7ecfff; --ipglow:rgba(126,207,255,0.55); animation:icon-pulse calc(2s / var(--ent-spd,1)) ease-in-out infinite; }

    .tile-sensor-chips { display:flex; flex-wrap:wrap; gap:4px; margin:2px 0 0; }
    .tile-sensor-chip { display:flex; flex-direction:column; align-items:center; background:rgba(255,255,255,.05); border:1px solid rgba(255,255,255,.08); border-radius:6px; padding:2px 7px; min-width:38px; }
    .tsc-lbl { font-size:.6em; color:var(--sc-text-muted); text-transform:uppercase; letter-spacing:.03em; }
    .tsc-val { font-size:calc(var(--sc-text-scale,1) * .78em); color:var(--sc-text-primary); font-weight:500; }
    .tile-sensor-chip.warn .tsc-val { color:var(--sc-accent); }

    .tile-bot { display:flex; align-items:center; justify-content:space-between; gap:4px; min-width:0; }
    .tile-power { font-size:.95em; font-weight:700; color:var(--sc-power-color); font-variant-numeric:tabular-nums; }
    .tile-badges { display:flex; gap:4px; align-items:center; margin-left:auto; }
    .type-badge,.gen-badge,.int-badge-tile { font-size:9px; font-weight:600; letter-spacing:.03em; padding:2px 5px; border-radius:4px; line-height:1.4; white-space:nowrap; }
    .type-relay       { background:rgba(99,102,241,.25);  color:#a5b4fc; }
    .type-dimmer      { background:rgba(234,179,8,.20);   color:#fde047; }
    .type-rgb         { background:rgba(236,72,153,.22);  color:#f9a8d4; }
    .type-plug        { background:rgba(34,197,94,.20);   color:#86efac; }
    .type-cover       { background:rgba(14,165,233,.20);  color:#7dd3fc; }
    .type-energy      { background:rgba(245,158,11,.22);  color:#fcd34d; }
    .type-sensor      { background:rgba(20,184,166,.20);  color:#5eead4; }
    .type-input       { background:rgba(168,85,247,.20);  color:#d8b4fe; }
    .type-climate     { background:rgba(239,68,68,.22);   color:#fca5a5; }
    .gen-1   { background:rgba(107,114,128,.25); color:#9ca3af; }
    .gen-2   { background:rgba(59,130,246,.22);  color:#93c5fd; }
    .gen-3   { background:rgba(34,197,94,.20);   color:#86efac; }
    .gen-4   { background:rgba(168,85,247,.20);  color:#d8b4fe; }
    .gen-ble { background:rgba(6,182,212,.20);   color:#67e8f9; }
    .int-badge-tile { background:rgba(255,255,255,.06); color:var(--sc-text-muted); }
    .tile-ui-link { font-size:11px; font-weight:700; color:var(--sc-accent); text-decoration:none; padding:1px 4px; border-radius:4px; opacity:.75; transition:opacity .15s; }
    .tile-ui-link:hover { opacity:1; }

    .alert-badge { font-size:9px; font-weight:700; padding:2px 5px; border-radius:4px; white-space:nowrap; animation:blink 1.5s step-end infinite; }
    .alert-overtemp  { background:rgba(251,146,60,.25); color:#fdba74; }
    .alert-overpower { background:rgba(239,68,68,.25);  color:#fca5a5; }

    .tog { padding:var(--tog-pad,4px 11px); border:none; border-radius:var(--tog-radius,20px); aspect-ratio:var(--tog-aspect,auto); cursor:pointer; font-size:var(--tog-fsize,.72em); font-weight:700; letter-spacing:.05em; flex-shrink:0; transition:transform .1s,opacity .15s,box-shadow .15s; position:relative; overflow:hidden; display:inline-flex; align-items:center; justify-content:center; }
    .tog::after { content:''; position:absolute; inset:0; background:white; opacity:0; transition:opacity .15s; }
    .tog:active::after { opacity:.15; }
    .tog.sm { padding:2px 9px; font-size:.68em; }
    .tog.on { background:var(--tog-on-bg,linear-gradient(135deg,var(--sc-accent),color-mix(in srgb,var(--sc-accent) 70%,#f97316))); color:var(--tog-on-color,white); box-shadow:var(--tog-on-shadow,0 2px 8px var(--sc-accent-glow)); border:var(--tog-on-border,none); }
    .tog.off { background:var(--sc-tog-off-bg); color:var(--sc-text-secondary); border:1px solid var(--sc-tog-off-border); }
    .tog.update { background:linear-gradient(135deg,var(--sc-update-color),color-mix(in srgb,var(--sc-update-color) 60%,#f97316)); color:white; box-shadow:0 2px 6px var(--sc-update-glow); }
    .tog:hover { opacity:.85; transform:scale(1.04); }
    .tog:active { transform:scale(.96); }

    .tile-dim-row { display:flex; align-items:center; gap:8px; padding:2px 0 0; }
    .dim-slider { flex:1; min-width:0; cursor:pointer; accent-color:var(--sc-accent); }
    .dim-slider:disabled { opacity:.3; }
    .dim-pct { font-size:.68em; font-weight:600; color:var(--sc-text-secondary); min-width:30px; text-align:right; }
    .color-swatch { width:30px; height:20px; border-radius:5px; border:none; cursor:pointer; padding:1px; background:transparent; flex-shrink:0; }
    .color-swatch:disabled { opacity:.3; }

    .cov-btns { display:flex; gap:2px; }
    .cov-btn { background:var(--sc-tog-off-bg); border:1px solid var(--sc-tog-off-border); border-radius:6px; color:var(--sc-text-primary); cursor:pointer; font-size:10px; padding:3px 7px; transition:background .15s; }
    .cov-btn:hover { background:rgba(255,255,255,.15); }
    .cov-btn.stop { color:var(--sc-text-muted); }
    .cov-pos-row { display:flex; align-items:center; gap:6px; padding:4px 0 2px; }
    .cov-bar { flex:1; height:4px; background:rgba(255,255,255,.10); border-radius:3px; overflow:hidden; }
    .cov-fill { height:100%; background:var(--sc-accent); border-radius:3px; transition:width .4s; }
    .cov-pct { font-size:10px; color:var(--sc-text-secondary); min-width:34px; text-align:right; }

    .tile-trv-row { display:flex; align-items:center; gap:8px; padding:2px 0 0; }
    .trv-temps { display:flex; align-items:baseline; gap:4px; flex:1; min-width:0; }
    .trv-cur { font-size:.82em; color:var(--sc-text-secondary); font-variant-numeric:tabular-nums; }
    .trv-sep { font-size:.7em; color:var(--sc-text-muted); }
    .trv-target { font-size:.95em; font-weight:700; color:var(--sc-text-value); font-variant-numeric:tabular-nums; }
    .trv-target.heating { color:var(--sc-accent); }
    .trv-flame { font-size:.75em; flex-shrink:0; }
    .trv-step-btns { display:flex; gap:3px; flex-shrink:0; }
    .trv-step { width:22px;height:22px; border:1px solid var(--sc-tog-off-border); border-radius:6px; background:var(--sc-tog-off-bg); color:var(--sc-text-secondary); font-size:1em; font-weight:700; cursor:pointer; display:flex; align-items:center; justify-content:center; padding:0; }
    .trv-step:hover { background:var(--sc-accent); color:white; }
    .trv-ctrl-row { display:flex; align-items:center; gap:12px; margin-bottom:6px; }
    .trv-big-btn { width:36px;height:36px; border:1px solid var(--sc-tog-off-border); border-radius:50%; background:var(--sc-tog-off-bg); color:var(--sc-text-primary); font-size:1.3em; font-weight:700; cursor:pointer; display:flex; align-items:center; justify-content:center; padding:0; flex-shrink:0; }
    .trv-big-btn:hover { background:var(--sc-accent); color:white; }
    .trv-display { flex:1; display:flex; flex-direction:column; align-items:center; gap:3px; }
    .trv-target-big { font-size:1.8em; font-weight:700; color:var(--sc-text-primary); font-variant-numeric:tabular-nums; }
    .trv-current-sub { font-size:.78em; color:var(--sc-text-secondary); }
    .trv-action-badge { font-size:.65em; font-weight:700; letter-spacing:.06em; text-transform:uppercase; padding:2px 7px; border-radius:10px; }
    .trv-action-badge.heating { background:color-mix(in srgb,var(--sc-accent) 20%,transparent); color:var(--sc-accent); }
    .trv-mode-row { display:flex; gap:6px; margin-bottom:6px; }
    .trv-range-lbl { font-size:.68em; color:var(--sc-text-muted); flex-shrink:0; }
    .dim-wrap { display:flex; flex-direction:row; align-items:center; gap:6px; flex:1; min-width:0; }

    .tile-trv-dial { display:flex; flex-direction:column; align-items:center; justify-content:center; flex:1; width:100%; padding:4px 0; }
    .trv-dial-svg { width:100%; max-width:360px; height:auto; overflow:visible; }
    .dial-target-text { font-size:30px; font-weight:700; fill:var(--sc-text-primary,#fff); }
    .dial-sub-text { font-size:11px; fill:var(--sc-text-secondary,rgba(255,255,255,0.5)); }
    .dial-current-text { font-size:13px; fill:var(--sc-text-secondary,rgba(255,255,255,0.65)); }
    .dial-range-text { font-size:11px; fill:var(--sc-text-secondary,rgba(255,255,255,0.5)); }
    .trv-dial-btns { display:flex; align-items:center; gap:12px; margin-top:2px; }
    .trv-stat-row { display:flex; gap:10px; justify-content:center; margin-top:4px; }
    .trv-stat { display:flex; flex-direction:column; align-items:center; }
    .trv-stat-lbl { font-size:10px; color:var(--sc-text-secondary,rgba(255,255,255,0.55)); }
    .trv-stat-val { font-size:13px; font-weight:600; color:var(--sc-text-primary,#fff); }
    .trv-presets { display:flex; flex-wrap:wrap; gap:4px; justify-content:center; margin-top:6px; }
    .trv-preset-btn { font-size:11px; padding:3px 8px; border-radius:12px; border:1px solid var(--sc-border); background:transparent; color:var(--sc-text-primary); cursor:pointer; white-space:nowrap; }
    .trv-preset-btn.active { background:var(--sc-accent,#e67e22); border-color:var(--sc-accent,#e67e22); color:#fff; }

    .valve-interactive { cursor:pointer; touch-action:none; }
    .valve-dial-btns { display:flex; align-items:center; gap:8px; margin-top:10px; }
    .valve-btn { padding:4px 14px; border-radius:8px; border:1px solid var(--sc-tog-off-border); background:var(--sc-tog-off-bg); color:var(--sc-text-primary); font-size:12px; font-weight:600; cursor:pointer; transition:background .15s; }
    .valve-btn:hover { background:rgba(255,255,255,.15); }
    .valve-btn.open:hover { background:#0ea5e9; border-color:#0ea5e9; color:#fff; }
    .valve-btn.close:hover { background:#6b7280; border-color:#6b7280; color:#fff; }
    .valve-btn.stop { color:var(--sc-text-muted); font-size:10px; }
    .valve-slider-row { display:flex; align-items:center; gap:6px; width:100%; padding:4px 8px 0; box-sizing:border-box; }

    .tile-inputs { display:flex; flex-direction:column; gap:5px; padding:4px 0 2px; }
    .input-row { display:flex; align-items:center; gap:8px; padding:5px 8px; border-radius:8px; border:1px solid rgba(255,255,255,.06); background:rgba(255,255,255,.04); transition:all .15s; }
    .input-row.active { background:color-mix(in srgb,var(--sc-accent) 15%,transparent); border-color:color-mix(in srgb,var(--sc-accent) 35%,transparent); }
    .input-row-dot { width:8px; height:8px; border-radius:50%; background:var(--sc-text-muted); flex-shrink:0; transition:background .15s; }
    .input-row.active .input-row-dot { background:var(--sc-accent); }
    .input-btn-dot { width:8px; height:8px; border-radius:2px; background:rgba(129,140,248,0.5); flex-shrink:0; }
    .input-row.btn-mode { border-color:rgba(129,140,248,0.18); }
    .input-row-name { font-size:13px; font-weight:600; color:var(--sc-text-primary); min-width:60px; }
    .input-row-event { flex:1; font-size:12px; color:var(--sc-text-secondary); text-transform:capitalize; }
    .input-row-time { font-size:11px; color:var(--sc-text-muted); white-space:nowrap; }
    .input-chip { display:flex; align-items:center; gap:4px; padding:4px 10px 4px 8px; border-radius:14px; border:1px solid rgba(255,255,255,.08); background:rgba(255,255,255,.05); font-size:12px; color:var(--sc-text-muted); transition:all .15s; }
    .input-chip.active { background:color-mix(in srgb,var(--sc-accent) 20%,transparent); color:var(--sc-accent); border-color:color-mix(in srgb,var(--sc-accent) 40%,transparent); }
    .input-dot { width:7px;height:7px; border-radius:50%; background:currentColor; flex-shrink:0; }
    .input-lbl { font-weight:600; }

    /* ── Virtual controls ── */
    .tile-virtuals { display:flex; flex-direction:column; gap:4px; padding:4px 0 2px; }
    .virt-row { display:flex; align-items:center; gap:8px; padding:4px 8px; border-radius:7px; border:1px solid rgba(255,255,255,.06); background:rgba(255,255,255,.03); }
    .virt-lbl { font-size:11px; color:var(--sc-text-muted); flex:1; min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
    .virt-val { font-size:12px; color:var(--sc-text-primary); font-weight:500; max-width:90px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; text-transform:capitalize; }
    .virt-select, .virt-num { display:flex; align-items:center; gap:3px; }
    .virt-arr { background:none; border:none; color:var(--sc-text-secondary); cursor:pointer; font-size:15px; padding:0 3px; line-height:1; border-radius:4px; transition:color .12s; }
    .virt-arr:hover { color:var(--sc-accent); }
    .virt-btn { background:color-mix(in srgb,var(--sc-accent) 12%,transparent); border:1px solid color-mix(in srgb,var(--sc-accent) 30%,transparent); color:var(--sc-accent); font-size:11px; font-weight:600; padding:3px 10px; border-radius:6px; cursor:pointer; transition:all .15s; width:100%; text-align:left; }
    .virt-btn:hover { background:color-mix(in srgb,var(--sc-accent) 22%,transparent); }

    .power-bar { position:absolute; bottom:0;left:0;right:0; height:3px; background:rgba(255,255,255,.06); border-radius:0 0 var(--tile-radius) var(--tile-radius); overflow:hidden; }
    .power-bar-fill { height:100%; background:linear-gradient(90deg,var(--sc-accent),#f97316); border-radius:inherit; transition:width .4s; }

    /* ── Expanded panel ── */
    .expanded { margin-top:10px; border-top:1px solid color-mix(in srgb,var(--sc-accent) 25%,transparent); padding-top:12px; display:flex; flex-wrap:wrap; gap:16px; align-items:flex-start; animation:slide-in .2s ease; }
    .exp-section { flex:1; min-width:140px; }
    .exp-section--full { flex:1 1 100%; min-width:0; }
    .exp-label { font-size:.68em; text-transform:uppercase; letter-spacing:.08em; color:var(--sc-text-muted); margin-bottom:7px; font-weight:600; }
    .exp-row { display:flex; align-items:center; justify-content:space-between; gap:8px; padding:3px 0; }
    .exp-name { font-size:.84em; color:var(--sc-text-detail); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:40%; }
    .sensor-row { display:flex; flex-wrap:wrap; gap:6px; }
    .sensor-chip { display:flex; align-items:center; gap:5px; background:var(--sc-sensor-bg); border-radius:20px; padding:4px 10px; white-space:nowrap; }
    .sensor-label { font-size:.65em; text-transform:uppercase; letter-spacing:.05em; color:var(--sc-text-muted); }
    .sensor-value { font-size:calc(var(--sc-text-scale,1) * .85em); font-weight:600; color:var(--sc-text-value); font-variant-numeric:tabular-nums; }
    .sensor-value.warn { color:var(--error-color,#ef4444); }
    .expanded-graph-header { display:flex; justify-content:flex-end; padding:0 0 4px; }
    .spark-refresh-all { background:none; border:1px solid rgba(255,255,255,.12); border-radius:6px; color:var(--sc-text-muted); font-size:.75em; cursor:pointer; padding:3px 10px; transition:color .15s,border-color .15s; }
    .spark-refresh-all:hover { color:var(--sc-accent); border-color:var(--sc-accent); }

    /* ── Entity list ── */
    .ent-list-header { display:flex; align-items:center; justify-content:space-between; cursor:pointer; user-select:none; padding:4px 0; }
    .ent-caret { font-size:.65em; color:var(--sc-text-muted); transition:transform .2s; flex-shrink:0; }
    .ent-caret.open { transform:rotate(180deg); }
    .ent-list { display:flex; flex-direction:column; gap:2px; margin-top:6px; }
    .ent-row { display:flex; align-items:center; gap:6px; padding:4px 6px; border-radius:6px; background:var(--sc-tile-bg); min-height:28px; }
    .ent-domain { font-size:.62em; font-weight:700; text-transform:uppercase; letter-spacing:.04em; min-width:72px; flex-shrink:0; color:var(--sc-text-muted); }
    .ent-name { font-size:.82em; color:var(--sc-text-detail); flex:1; min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
    .ent-state { font-size:.78em; color:var(--sc-text-secondary); font-family:monospace; white-space:nowrap; flex-shrink:0; }

    /* ── Sparklines ── */
    .sparklines-block { display:flex; flex-direction:column; gap:4px; padding:4px 8px 2px; }
    .sparklines-block.exp { padding:6px 8px 4px; gap:8px; }
    .spark-group { display:flex; flex-direction:column; gap:0; }
    .spark-row { display:flex; align-items:center; gap:6px; min-height:32px; }
    .spark-lbl { font-size:.62em; font-weight:700; text-transform:uppercase; letter-spacing:.05em; color:var(--sc-text-muted); width:68px; flex-shrink:0; text-align:right; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
    .spark-svg-wrap { flex:1; position:relative; min-width:0; }
    .sparkline-svg { width:100%; height:32px; display:block; overflow:visible; cursor:crosshair; }
    .sparkline-svg.exp { height:48px; }
    .spark-tick { stroke:rgba(255,255,255,.2); stroke-width:.5; stroke-dasharray:3 3; pointer-events:none; }
    .spark-crosshair { stroke:rgba(255,255,255,.35); stroke-width:.6; stroke-dasharray:2 2; pointer-events:none; }
    .spark-hover-dot { fill:var(--sc-graph-line); stroke:var(--sc-card-bg,#1e1e2e); stroke-width:1.5; pointer-events:none; }
    .spark-tooltip {
      position:absolute; bottom:calc(100% + 4px); transform:translateX(-50%);
      background:rgba(14,14,28,.92); border:1px solid rgba(255,255,255,.12); border-radius:6px;
      padding:4px 8px; pointer-events:none; white-space:nowrap; z-index:20;
      display:flex; flex-direction:column; align-items:center; gap:1px;
    }
    .spark-tooltip-val  { font-size:.78em; font-weight:700; color:var(--sc-graph-line); }
    .spark-tooltip-time { font-size:.65em; color:var(--sc-text-muted); }
    .spark-val { font-size:.75em; font-weight:600; color:var(--sc-text-secondary); white-space:nowrap; min-width:44px; text-align:right; }
    .spark-time-row { display:flex; align-items:center; gap:6px; padding-bottom:1px; }
    .spark-time-spacer { width:68px; flex-shrink:0; }
    .spark-time-labels { flex:1; display:flex; justify-content:space-between; font-size:.55em; color:var(--sc-text-muted); opacity:.65; user-select:none; }
    .spark-time-end { min-width:44px; }
    .spark-no-data { flex:1; font-size:.7em; color:var(--sc-text-muted); opacity:.6; display:flex; align-items:center; padding-left:4px; }
    .spark-retry { background:none; border:none; color:var(--sc-text-muted); font-size:1em; cursor:pointer; padding:0 4px; opacity:.6; }
    .spark-retry:hover { opacity:1; color:var(--sc-accent); }
    @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
    .sparkline-loading { flex:1; height:32px; border-radius:4px;
      background:linear-gradient(90deg,rgba(255,255,255,.03) 0%,rgba(255,255,255,.08) 50%,rgba(255,255,255,.03) 100%);
      background-size:200% 100%; animation:shimmer 1.6s ease-in-out infinite; }
    .sparkline-loading.exp { height:48px; }

    /* ── RGBW white + effects ── */
    .tile-white-row { margin-top:2px; }
    .dim-white-lbl { font-size:.6em; font-weight:700; text-transform:uppercase; letter-spacing:.05em; color:var(--sc-text-muted); width:14px; flex-shrink:0; text-align:center; }
    .white-slider { accent-color:#e5e7eb; }
    .tile-effects { display:flex; flex-wrap:wrap; gap:4px; padding:4px 8px 2px; }
    .effect-btn { padding:2px 9px; border-radius:12px; border:1px solid rgba(255,255,255,.12); background:rgba(255,255,255,.05); color:var(--sc-text-secondary); font-size:10px; cursor:pointer; transition:all .15s; white-space:nowrap; }
    .effect-btn:hover { background:rgba(255,255,255,.1); color:var(--sc-text-primary); }
    .effect-btn.active { background:color-mix(in srgb,var(--sc-accent) 25%,transparent); border-color:color-mix(in srgb,var(--sc-accent) 50%,transparent); color:var(--sc-accent); }

    /* ── Graph dialog ── */
    .graph-dialog-backdrop { position:fixed; inset:0; background:rgba(0,0,0,.65); backdrop-filter:blur(4px); z-index:9999; display:flex; align-items:center; justify-content:center; }
    .graph-dialog { background:var(--sc-card-bg); border:1px solid rgba(255,255,255,.12); border-radius:16px; padding:20px; width:min(720px,92vw); max-height:85vh; overflow-y:auto; }
    .graph-dialog-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; font-size:15px; font-weight:600; color:var(--sc-text-primary); }
    .graph-dialog-close { background:none; border:none; color:var(--sc-text-muted); font-size:18px; cursor:pointer; padding:4px 8px; border-radius:6px; transition:all .15s; }
    .graph-dialog-close:hover { color:var(--sc-text-primary); background:rgba(255,255,255,.08); }
    .spark-row-clickable { cursor:pointer; border-radius:6px; transition:background .15s; }
    .spark-row-clickable:hover { background:rgba(255,255,255,.05); }
    .graph-dialog .sparklines-block { padding:0; }
    .graph-dialog .spark-lbl { width:90px; font-size:.7em; }
    .graph-dialog .sparkline-svg { height:120px !important; }
    .graph-dialog .sparkline-loading { height:120px !important; }
    .graph-dialog .spark-group { margin-bottom:12px; }

    /* ── Relay channels ── */
    .relay-channels { display:flex; flex-direction:column; gap:4px; padding:2px 8px 4px; }
    .relay-ch-row { display:flex; align-items:center; gap:8px; padding:3px 0; }
    .relay-ch-dot { width:7px; height:7px; border-radius:50%; background:var(--sc-offline-dot); flex-shrink:0; transition:background .15s; }
    .relay-ch-dot.on { background:var(--sc-online-color); }
    .relay-ch-name { flex:1; font-size:12px; color:var(--sc-text-secondary); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }

  `,e([ge({attribute:!1})],qe.prototype,"hass",void 0),e([ge({type:Boolean})],qe.prototype,"preview",void 0),e([fe()],qe.prototype,"_config",void 0),e([fe()],qe.prototype,"_closedAreas",void 0),e([fe()],qe.prototype,"_entityListOpen",void 0),e([fe()],qe.prototype,"_graphData",void 0),e([fe()],qe.prototype,"_valveDragPos",void 0),e([fe()],qe.prototype,"_trvDragTemp",void 0),e([fe()],qe.prototype,"_graphDialog",void 0),e([fe()],qe.prototype,"_cloudDetailOpen",void 0),qe=Ge=e([pe("ha-device-dashboard")],qe),function(e){e.language="language",e.system="system",e.comma_decimal="comma_decimal",e.decimal_comma="decimal_comma",e.space_comma="space_comma",e.none="none"}(Ye||(Ye={})),function(e){e.language="language",e.system="system",e.am_pm="12",e.twenty_four="24"}(Ze||(Ze={}));var Qe=function(e,t,i,o){o=o||{},i=null==i?{}:i;var a=new Event(t,{bubbles:void 0===o.bubbles||o.bubbles,cancelable:Boolean(o.cancelable),composed:void 0===o.composed||o.composed});return a.detail=i,e.dispatchEvent(a),a};const Xe=[{label:"Default",value:void 0},{label:"Inter",value:"Inter, sans-serif"},{label:"Roboto",value:"Roboto, sans-serif"},{label:"Mono",value:"'IBM Plex Mono', monospace"},{label:"System",value:"system-ui, sans-serif"}],Je=[{group:"Electrical",icon:"⊕",iconColor:"#4a9eff",iconBg:"rgba(74,158,255,0.1)",items:[{key:"power",label:"Power",unit:"W",defaultColor:"#f4601e"},{key:"voltage",label:"Voltage",unit:"V",defaultColor:"#a78bfa"},{key:"current",label:"Current",unit:"A",defaultColor:"#fbbf24"},{key:"energy",label:"Energy (kWh)",unit:"kWh",defaultColor:"#4ade80"},{key:"frequency",label:"Frequency",unit:"Hz",defaultColor:"#34d399"},{key:"apparent_power",label:"App. Power",unit:"VA",defaultColor:"#f472b6"},{key:"reactive_power",label:"React. Power",unit:"VAr",defaultColor:"#818cf8"},{key:"power_factor",label:"Power Factor",unit:"%",defaultColor:"#fb923c"}]},{group:"Environmental",icon:"◌",iconColor:"#4ade80",iconBg:"rgba(74,222,128,0.1)",items:[{key:"temperature",label:"Temperature",unit:"°C",defaultColor:"#4fc3f7"},{key:"humidity",label:"Humidity",unit:"%",defaultColor:"#2dd4bf"},{key:"illuminance",label:"Illuminance",unit:"lx",defaultColor:"#fde047"},{key:"co2",label:"CO₂",unit:"ppm",defaultColor:"#a3e635"},{key:"gas",label:"Gas",unit:"%",defaultColor:"#fb923c"}]},{group:"Device Info",icon:"◎",iconColor:"#a78bfa",iconBg:"rgba(167,139,250,0.1)",items:[{key:"cloud",label:"Cloud status",unit:"",defaultColor:"#7dd3fc"},{key:"rssi",label:"Wi-Fi RSSI",unit:"dBm",defaultColor:"#7dd3fc"},{key:"uptime",label:"Uptime",unit:"",defaultColor:"#86efac"},{key:"ip",label:"IP Address",unit:"",defaultColor:"#94a3b8"},{key:"ssid",label:"SSID",unit:"",defaultColor:"#94a3b8"},{key:"battery",label:"Battery",unit:"%",defaultColor:"#86efac"},{key:"fw_version",label:"Firmware",unit:"",defaultColor:"#94a3b8"},{key:"mac",label:"MAC Address",unit:"",defaultColor:"#94a3b8"}]},{group:"Alerts",icon:"⚠",iconColor:"#f87171",iconBg:"rgba(239,68,68,0.15)",items:[{key:"overtemp",label:"Overtemp",unit:"",defaultColor:"#f87171"},{key:"overpower",label:"Overpower",unit:"",defaultColor:"#f87171"},{key:"motion",label:"Motion",unit:"",defaultColor:"#f87171"},{key:"door",label:"Door / Window",unit:"",defaultColor:"#f87171"},{key:"flood",label:"Flood",unit:"",defaultColor:"#f87171"},{key:"smoke",label:"Smoke",unit:"",defaultColor:"#f87171"}]}],Ke=[{key:"power",label:"Power",unit:"W",color:"#f4601e"},{key:"voltage",label:"Voltage",unit:"V",color:"#a78bfa"},{key:"current",label:"Current",unit:"A",color:"#fbbf24"},{key:"energy",label:"Energy",unit:"kWh",color:"#4ade80"},{key:"apparent_power",label:"App. Power",unit:"VA",color:"#f472b6"},{key:"reactive_power",label:"React. Power",unit:"VAr",color:"#818cf8"},{key:"frequency",label:"Frequency",unit:"Hz",color:"#34d399"},{key:"power_factor",label:"Power Factor",unit:"%",color:"#fb923c"},{key:"temperature",label:"Temperature",unit:"°C",color:"#4fc3f7"},{key:"humidity",label:"Humidity",unit:"%",color:"#2dd4bf"},{key:"illuminance",label:"Illuminance",unit:"lx",color:"#fde047"},{key:"co2",label:"CO₂",unit:"ppm",color:"#a3e635"},{key:"battery",label:"Battery",unit:"%",color:"#86efac"},{key:"rssi",label:"RSSI",unit:"dBm",color:"#7dd3fc"}],et=[{id:"name_row",label:"Name row",sub:"Device name + status dot + primary control"},{id:"sensors",label:"Sensor chips",sub:"Power, temp, voltage, RSSI…"},{id:"graph",label:"Sparkline graph",sub:"History sparklines per selected sensor"},{id:"dimmer",label:"Dimmer / color",sub:"Brightness + color picker for lights"},{id:"cover_controls",label:"Cover controls",sub:"Open / stop / close + position"},{id:"trv_control",label:"TRV control",sub:"Thermostat display + ± buttons"},{id:"power_bar",label:"Power bar",sub:"Mini usage bar at tile bottom"},{id:"virtual_controls",label:"Virtual controls",sub:"Script-defined switches, selectors & actions"},{id:"badges",label:"Type & gen badges",sub:"Dimmer · G3 · Relay labels"}],tt=["style","tile_size","tile_opacity","card_opacity","card_bg_image","card_bg_image_size","tile_layout","graph_style","graph_sensors","graph_hours","graph_line_color","graph_sensor_colors","sensors","sort_by","view_mode","columns","show_power_bar","power_bar_max","area_styles","device_styles"];let it=class extends ce{constructor(){super(...arguments),this._tab="devices",this._openSections={rooms:!0,grid:!0,tileorder:!0,header:!1,colors:!0,tiles:!0,typography:!1,buttons:!1,roomstyles:!1,graphtype:!0,graphcolors:!1,electrical:!0,environmental:!0,deviceinfo:!1,alerts:!1},this._expandedRooms=new Set,this._expandedDevices=new Set,this._deviceSearch="",this._bgEditArea=null,this._styleTab={},this._hiddenBlocks=new Set,this._dragOrder=et.map(e=>e.id),this._dragOver=null,this._styleClipFeedback="",this._copyAreaOpen=!1,this._copyJson="",this._pasteOpen=!1,this._pasteText=""}setConfig(e){this._config=e}_set(e,t){if(!this._config)return;const i={...this._config,[e]:t};(""===t||void 0===t||Array.isArray(t)&&0===t.length&&"areas"!==e)&&delete i[e],Qe(this,"config-changed",{config:i})}_toggleSec(e){this._openSections={...this._openSections,[e]:!this._openSections[e]}}_showStyleFeedback(e){this._styleClipFeedback=e,clearTimeout(this._styleClipTimer),this._styleClipTimer=window.setTimeout(()=>{this._styleClipFeedback=""},1500)}_copyStyle(){const e={};for(const t of tt){const i=this._config[t];void 0!==i&&(e[t]=i)}this._copyJson=JSON.stringify(e),this._copyAreaOpen=!0,this._pasteOpen=!1,navigator.clipboard.writeText(this._copyJson).catch(e=>{console.warn("[editor] clipboard write failed",e)})}_applyPastedStyle(){try{const e=JSON.parse(this._pasteText),t=tt.some(t=>t in e);if(!t)return void this._showStyleFeedback("Invalid style data");const i={...this._config};for(const t of tt)t in e&&(i[t]=e[t]);Qe(this,"config-changed",{config:i}),this._showStyleFeedback("Applied!"),this._pasteOpen=!1,this._pasteText=""}catch{this._showStyleFeedback("Invalid style data")}}_getAreas(){return this.hass?Object.values(this.hass.areas??{}).map(e=>({id:e.area_id,name:e.name})).sort((e,t)=>e.name.localeCompare(t.name)):[]}_getAllHADevices(){if(!this.hass)return[];const e=this.hass.devices??{},t=this.hass.entities??{},i=new Set,o=[];for(const a of Object.values(t)){const t=a?.device_id;if(!t||i.has(t))continue;i.add(t);const r=e[t];if(!r)continue;const n=r.area_id??a.area_id,s=n?this.hass.areas?.[n]?.name:void 0;o.push({device_id:t,name:r.name_by_user??r.name??t,area:s})}return o.sort((e,t)=>e.name.localeCompare(t.name))}_getDiscoveredDevices(){if(!this.hass)return[];const e=this._config.areas;let t=we(this.hass);if(void 0!==e){const i=new Set(e.map(e=>e.toLowerCase()));t=t.filter(e=>i.has((e.area??"").toLowerCase()))}return t.map(e=>({device_id:e.device_id,name:e.name,area:e.area})).sort((e,t)=>e.name.localeCompare(t.name))}_getEntitiesForDevice(e){const t=this.hass.entities??{},i=[];for(const[o,a]of Object.entries(t)){if(a.device_id!==e)continue;const t=this.hass.states[o];i.push({entity_id:o,name:t?.attributes?.friendly_name??o,domain:o.split(".")[0]})}return i.sort((e,t)=>e.name.localeCompare(t.name))}_setAreaStyle(e,t,i){const o={...this._config.area_styles?.[e]??{}};void 0===i||""===i?delete o[t]:o[t]=i;const a={...this._config.area_styles??{}};Object.keys(o).length?a[e]=o:delete a[e],this._set("area_styles",Object.keys(a).length?a:void 0)}_clearAreaStyle(e){const t={...this._config.area_styles??{}};delete t[e],this._set("area_styles",Object.keys(t).length?t:void 0)}_triggerUpload(e){this.renderRoot.querySelector(`input[data-upload="${e}"]`)?.click()}_handleUpload(e,t){const i=t.target.files?.[0];if(!i)return;const o=new FileReader;o.onload=()=>this._setAreaStyle(e,"bgImage",o.result),o.onerror=()=>{console.warn("[editor] failed to read file",i.name)},o.readAsDataURL(i),t.target.value=""}_handleTileBgUpload(e){const t=e.target.files?.[0];if(!t)return;const i=new FileReader;i.onload=()=>{const e=this._config.style??{};this._set("style",{...e,tile_bg_image:i.result})},i.onerror=()=>{console.warn("[editor] failed to read file",t.name)},i.readAsDataURL(t),e.target.value=""}_handleCardBgUpload(e){const t=e.target.files?.[0];if(!t)return;const i=new FileReader;i.onload=()=>{this._set("card_bg_image",i.result)},i.onerror=()=>{console.warn("[editor] failed to read file",t.name)},i.readAsDataURL(t),e.target.value=""}_sec(e,t,i,o,a,r,n){const s=this._openSections[e];return V`
      <div class="sec ${s?"open":""}">
        <div class="sec-hdr" @click=${()=>this._toggleSec(e)}>
          <div class="sec-hdr-l">
            <div class="sec-ico" style="background:${i};color:${o}">${t}</div>
            <span class="sec-title">${a}</span>
          </div>
          <div class="sec-hdr-r">${r}<span class="chev">▼</span></div>
        </div>
        <div class="sec-body">${n}</div>
      </div>`}_badge(e,t,i){return V`<span class="sec-badge" style="color:${t};background:${i}">${e}</span>`}_renderDevicesTab(){const e=this._config,t=this._getAreas(),i=t.map(e=>e.name),o=e.areas,a=e=>{const t=void 0===o?new Set(i):new Set(o);t.has(e)?t.delete(e):t.add(e);const a=t.size===i.length?void 0:[...t];this._set("areas",a)},r=this._getDiscoveredDevices(),n=e.hidden_devices??[],s=new Map;for(const e of r){const t=e.area??"";s.has(t)||s.set(t,[]),s.get(t).push(e)}const l=[...t.map(e=>e.name)];s.has("")&&l.push("");const c=void 0===o?t.length:o.length,d=this._badge(`${c} / ${t.length}`,"#4ade80","rgba(74,222,128,0.1)"),p=V`
      <div class="rooms-toolbar">
        <div class="toolbar-group">
          <span class="toolbar-lbl">Sort</span>
          <div class="pill-grp">
            ${["name","power","online"].map(t=>V`
              <span class="pill ${(e.sort_by??"name")===t?"on":""}"
                @click=${()=>this._set("sort_by",t)}>${t[0].toUpperCase()+t.slice(1)}</span>`)}
          </div>
        </div>
        <div class="toolbar-group">
          <span class="toolbar-lbl">View</span>
          <div class="pill-grp">
            ${["grid","list","compact"].map(t=>V`
              <span class="pill ${(e.view_mode??"grid")===t?"on":""}"
                @click=${()=>this._set("view_mode",t)}>${t[0].toUpperCase()+t.slice(1)}</span>`)}
          </div>
        </div>
        <div class="tog-row" style="border:none;padding:4px 0 0">
          <div class="tog-lbl">Show offline devices</div>
          <label class="sw"><input type="checkbox" .checked=${!1!==e.show_offline}
            @change=${e=>this._set("show_offline",e.target.checked)}>
            <span class="sw-t"></span><span class="sw-b"></span></label>
        </div>
      </div>
      ${l.map(t=>{const i=t||"No Room",r=s.get(t)??[],l=(e=>void 0===o||o.includes(e))(t),c=this._expandedRooms.has(t);return V`
          <div class="room-row">
            <div class="room-dot" style="background:${l?"#4ade80":"var(--t3)"}"></div>
            <span class="room-name" style="color:${l?"var(--text)":"var(--t2)"}">${i}</span>
            ${r.length?V`<span class="room-count">${r.length} devices</span>`:q}
            <label class="sw"><input type="checkbox" .checked=${l}
              @change=${()=>a(t)}>
              <span class="sw-t"></span><span class="sw-b"></span></label>
            <button class="room-style-btn" @click=${e=>{e.stopPropagation(),this._tab="layout",this._openSections={...this._openSections,roomstyles:!0},this._expandedRooms=new Set([...this._expandedRooms,t])}}>Style ›</button>
            <button class="room-style-btn" @click=${e=>{e.stopPropagation();const i=new Set(this._expandedRooms);i.has(t)?i.delete(t):i.add(t),this._expandedRooms=i}}>${c?"▲":"Devices"}</button>
          </div>
          ${c?V`
            <div class="room-devices">
              ${r.length?r.map(t=>{const i=n.includes(t.device_id),o=!!e.device_styles?.[t.device_id],a=this._expandedDevices.has(t.device_id);return V`
                  <div class="room-device-row">
                    <span class="room-device-name" style="color:${i?"var(--t3)":"var(--t2)"}">${t.name}</span>
                    ${o?V`<span class="dev-style-dot"></span>`:q}
                    <label class="sw">
                      <input type="checkbox" .checked=${!i} @change=${()=>{const e=i?n.filter(e=>e!==t.device_id):[...n,t.device_id];this._set("hidden_devices",e.length?e:void 0)}}>
                      <span class="sw-t"></span><span class="sw-b"></span>
                    </label>
                    <button class="room-style-btn" @click=${e=>{e.stopPropagation();const i=new Set(this._expandedDevices);i.has(t.device_id)?i.delete(t.device_id):i.add(t.device_id),this._expandedDevices=i}}>${a?"▲":"Style"}</button>
                  </div>
                  ${a?this._renderDeviceStyleInline(t.device_id):q}`}):V`<div class="room-device-empty">No devices in this room</div>`}
            </div>
          `:q}`})}`;return V`
      ${this._sec("rooms","⌂","rgba(74,222,128,0.1)","#4ade80","Rooms",d,p)}`}_setDeviceStyle(e,t){const i={...this._config.device_styles?.[e]??{},...t};void 0===i.color&&delete i.color,void 0===i.tile_layout&&delete i.tile_layout,void 0===i.tile_icon&&delete i.tile_icon,void 0===i.tile_icon_off&&delete i.tile_icon_off,void 0===i.tile_icon_speed&&delete i.tile_icon_speed,void 0===i.entity_animations&&delete i.entity_animations;const o={...this._config.device_styles??{},[e]:i};Object.keys(i).length||delete o[e],this._set("device_styles",Object.keys(o).length?o:void 0)}_renderDeviceStyleInline(e){const t=this._config.device_styles?.[e]??{},i=this._config.tile_layout??et.map(e=>e.id),o=t.tile_layout??null,a=t.entity_animations??{},r=t=>{const a=null===o?i.includes(t):o.includes(t),r=et.map(e=>e.id).filter(e=>e===t?!a:null===o?i.includes(e):o.includes(e)),n=r.length===i.length&&r.every(e=>i.includes(e));this._setDeviceStyle(e,{tile_layout:n?void 0:r})},n=(t,i,o)=>{const r={...a[t]??{}};if("speed"===i){const e=Number(o);1===e?delete r.speed:r.speed=e}else"none"===o?delete r[i]:r[i]=o;const n={...a,[t]:r};r.on||r.off||r.speed||delete n[t],this._setDeviceStyle(e,{entity_animations:Object.keys(n).length?n:void 0})},s=(this.hass?we(this.hass):[]).find(t=>t.device_id===e),l=s?s.entities.filter(e=>"switch"===e.domain||"light"===e.domain):[];return V`
      <div class="dev-style-panel">
        <div class="color-row">
          <span class="color-key">Accent colour</span>
          <span class="color-val">${t.color??"#f4601e"}</span>
          <input type="color" .value=${t.color??"#f4601e"}
            @change=${t=>this._setDeviceStyle(e,{color:t.target.value})}/>
          ${t.color?V`<button class="color-reset"
            @click=${()=>this._setDeviceStyle(e,{color:void 0})}>↺</button>`:q}
        </div>
        <div class="tile-icon-row">
          <span class="color-key">Tile icon</span>
          <div class="tile-icon-pickers">
            <span class="tile-icon-state-lbl">ON</span>
            <details class="icon-picker-wrap">
              <summary class="icon-picker-btn compact">
                ${t.tile_icon?Ue(t.tile_icon,!0,`--ent-spd:1;color:${He[t.tile_icon].on}`,"icon-preview-sm"):V`<span class="icon-cell-none">—</span>`}
              </summary>
              <div class="icon-picker-grid">
                ${We.map(i=>V`
                  <button
                    class="icon-cell ${(t.tile_icon??"none")===i.value?"selected":""}"
                    title="${i.group} ${i.label}"
                    @click=${t=>{this._setDeviceStyle(e,{tile_icon:"none"===i.value?void 0:i.value}),t.target.closest("details")?.removeAttribute("open")}}
                  >
                    ${"none"===i.value?V`<span class="icon-cell-none">—</span>`:Ue(i.value,!0,`--ent-spd:1;color:${He[i.value].on}`,"icon-preview")}
                    <span class="icon-cell-label">${i.label}</span>
                  </button>
                `)}
              </div>
            </details>
            <span class="tile-icon-state-lbl">OFF</span>
            <details class="icon-picker-wrap">
              <summary class="icon-picker-btn compact">
                ${t.tile_icon_off?Ue(t.tile_icon_off,!1,`--ent-spd:1;color:${He[t.tile_icon_off].off}`,"icon-preview-sm"):V`<span class="icon-cell-none">—</span>`}
              </summary>
              <div class="icon-picker-grid flip">
                ${We.map(i=>V`
                  <button
                    class="icon-cell ${(t.tile_icon_off??"none")===i.value?"selected":""}"
                    title="${i.group} ${i.label}"
                    @click=${t=>{this._setDeviceStyle(e,{tile_icon_off:"none"===i.value?void 0:i.value}),t.target.closest("details")?.removeAttribute("open")}}
                  >
                    ${"none"===i.value?V`<span class="icon-cell-none">—</span>`:Ue(i.value,!1,`--ent-spd:1;color:${He[i.value].off}`,"icon-preview")}
                    <span class="icon-cell-label">${i.label}</span>
                  </button>
                `)}
              </div>
            </details>
          </div>
          <select class="anim-select" style="width:90px" .value=${String(t.tile_icon_speed??1)}
            @change=${t=>{const i=Number(t.target.value);this._setDeviceStyle(e,{tile_icon_speed:1===i?void 0:i})}}>
            <option value="0.25" ?selected=${.25===(t.tile_icon_speed??1)}>0.25× Slow</option>
            <option value="0.5"  ?selected=${.5===(t.tile_icon_speed??1)}>0.5× Slow</option>
            <option value="1"    ?selected=${1===(t.tile_icon_speed??1)}>1× Normal</option>
            <option value="1.5"  ?selected=${1.5===(t.tile_icon_speed??1)}>1.5× Fast</option>
            <option value="2"    ?selected=${2===(t.tile_icon_speed??1)}>2× Fast</option>
            <option value="3"    ?selected=${3===(t.tile_icon_speed??1)}>3× Rapid</option>
            <option value="5"    ?selected=${5===(t.tile_icon_speed??1)}>5× Frantic</option>
          </select>
        </div>
        <div class="field-lbl" style="margin-bottom:4px">Visible blocks</div>
        <div class="block-toggles">
          ${et.map(e=>{const t=null===o?i.includes(e.id):o.includes(e.id);return V`<span class="block-tog ${t?"on":""}" @click=${()=>r(e.id)}>
              ${t?"👁":"○"} ${e.label}
            </span>`})}
        </div>
        ${l.length?V`
          <div class="field-lbl" style="margin:6px 0 4px">Entity animations</div>
          <div class="ent-anim-header">
            <span class="ent-anim-hcol name">Entity</span>
            <span class="ent-anim-hcol">When ON</span>
            <span class="ent-anim-hcol">When OFF</span>
            <span class="ent-anim-hcol">Speed</span>
          </div>
          ${l.map(e=>{const t=this.hass?.states[e.entity_id],i=t?.attributes?.friendly_name??e.entity_id.split(".").pop()??e.entity_id,o=a[e.entity_id]?.on??"none",r=a[e.entity_id]?.off??"none",s=a[e.entity_id]?.speed??1;return V`
              <div class="ent-anim-row">
                <span class="ent-anim-name">${i}</span>
                <details class="icon-picker-wrap">
                  <summary class="icon-picker-btn compact">
                    ${"none"!==o?Ue(o,!0,`--ent-spd:1;color:${He[o].on}`,"icon-preview-sm"):V`<span class="icon-cell-none">—</span>`}
                  </summary>
                  <div class="icon-picker-grid">
                    ${We.map(t=>V`
                      <button class="icon-cell ${o===t.value?"selected":""}"
                        title="${t.group} ${t.label}"
                        @click=${i=>{n(e.entity_id,"on",t.value),i.target.closest("details")?.removeAttribute("open")}}>
                        ${"none"===t.value?V`<span class="icon-cell-none">—</span>`:Ue(t.value,!0,`--ent-spd:1;color:${He[t.value].on}`,"icon-preview")}
                        <span class="icon-cell-label">${t.label}</span>
                      </button>`)}
                  </div>
                </details>
                <details class="icon-picker-wrap">
                  <summary class="icon-picker-btn compact">
                    ${"none"!==r?Ue(r,!1,`--ent-spd:1;color:${He[r].off}`,"icon-preview-sm"):V`<span class="icon-cell-none">—</span>`}
                  </summary>
                  <div class="icon-picker-grid flip">
                    ${We.map(t=>V`
                      <button class="icon-cell ${r===t.value?"selected":""}"
                        title="${t.group} ${t.label}"
                        @click=${i=>{n(e.entity_id,"off",t.value),i.target.closest("details")?.removeAttribute("open")}}>
                        ${"none"===t.value?V`<span class="icon-cell-none">—</span>`:Ue(t.value,!1,`--ent-spd:1;color:${He[t.value].off}`,"icon-preview")}
                        <span class="icon-cell-label">${t.label}</span>
                      </button>`)}
                  </div>
                </details>
                <select class="anim-select" .value=${String(s)}
                  @change=${t=>n(e.entity_id,"speed",t.target.value)}>
                  <option value="0.25" ?selected=${.25===s}>0.25× Slowest</option>
                  <option value="0.5"  ?selected=${.5===s}>0.5× Slow</option>
                  <option value="1"    ?selected=${1===s}>1× Normal</option>
                  <option value="1.5"  ?selected=${1.5===s}>1.5× Fast</option>
                  <option value="2"    ?selected=${2===s}>2× Faster</option>
                  <option value="3"    ?selected=${3===s}>3× Rapid</option>
                  <option value="5"    ?selected=${5===s}>5× Frantic</option>
                </select>
              </div>`})}
        `:q}
        <button class="room-style-btn" style="align-self:flex-end;margin-top:2px" @click=${()=>{const t={...this._config.device_styles??{}};delete t[e],this._set("device_styles",Object.keys(t).length?t:void 0)}}>Clear device style</button>
      </div>`}_renderRoomStyleInline(e){const t=this._config.area_styles?.[e]??{},i=this._styleTab[e]??"background",o=t=>{this._styleTab={...this._styleTab,[e]:t}},a=(i,o,a)=>{const r=t[o]??a;return V`
      <div class="color-row">
        <div class="color-preview-swatch" style="background:${r}"></div>
        <span class="color-key">${i}</span>
        <input type="color" .value=${r}
          @change=${t=>this._setAreaStyle(e,o,t.target.value)}/>
        ${t[o]?V`<button class="color-reset" @click=${()=>this._setAreaStyle(e,o,void 0)}>↺</button>`:q}
      </div>`},r=(i,o,a,r,n,s,l)=>V`
      <div class="sl-row">
        <span class="color-key">${i}</span>
        <input type="range" min="${a}" max="${r}" step="${n}" style="flex:1;accent-color:#f4601e"
          .value=${String(t[o]??s)}
          @input=${t=>this._setAreaStyle(e,o,parseInt(t.target.value,10))}/>
        <span class="sl-val">${t[o]??s}${l}</span>
      </div>`,n="background"===i?V`
        ${a("Color","bgColor","#1c1c1e")}
        <div class="color-row">
          <span class="color-key">Image</span>
          <input type="file" accept="image/*" hidden data-upload="${e}" @change=${t=>this._handleUpload(e,t)}/>
          <button class="upload-btn" @click=${()=>this._triggerUpload(e)}>↑ Upload</button>
          <input type="text" class="inline-text" placeholder="/local/img.jpg"
            .value=${t.bgImage?.startsWith("data:")?"(embedded)":t.bgImage??""}
            @change=${t=>{const i=t.target.value;this._setAreaStyle(e,"bgImage",i&&"(embedded)"!==i?i:void 0)}}/>
          ${t.bgImage?V`<button class="color-reset" @click=${()=>this._setAreaStyle(e,"bgImage",void 0)}>↺</button>`:q}
        </div>`:"header"===i?V`
        ${a("Gradient start","headerBgColor","#1a1a2e")}
        ${a("Gradient end","headerBgColor2","#0f3460")}
        ${a("Text color","textColor","#f4601e")}
        ${r("Font size","fontSize",8,32,1,12,"px")}`:"tiles"===i?V`
        ${a("Tile bg","tileBgColor","#1c1c1e")}
        ${r("Opacity","tileOpacity",0,100,1,100,"%")}
        ${a("Border","tileBorderColor","#ffffff")}
        ${r("Radius","tileBorderRadius",0,20,1,12,"px")}
        ${a("Accent","accentColor","#f4601e")}`:V`
        ${r("Columns","columns",1,6,1,3,"")}
        ${r("Gap","tileGap",4,24,2,10,"px")}
        ${r("Border width","borderWidth",0,8,1,1,"px")}
        ${r("Border radius","borderRadius",0,32,2,10,"px")}`;return V`
      <div class="room-style-panel">
        <div class="style-panel-hdr">
          <span>${e}</span>
          ${Object.keys(t).length?V`<button class="clear-btn" @click=${()=>this._clearAreaStyle(e)}>Clear all</button>`:q}
        </div>
        <div class="style-tabs">
          ${["background","header","tiles","layout"].map(e=>V`
            <button class="stab ${i===e?"on":""}" @click=${()=>o(e)}>${e[0].toUpperCase()+e.slice(1)}</button>`)}
        </div>
        <div class="style-body">${n}</div>
      </div>`}_renderLayoutTab(){const e=this._config,t=V`
      <div class="field">
        <div class="field-lbl">Columns <span class="field-note">overridden per-room in Style tab</span></div>
        <div class="step-row">
          <button class="step-btn" @click=${()=>this._set("columns",Math.max(1,(e.columns??1)-1))}>−</button>
          <span class="step-val">${e.columns??1}</span>
          <button class="step-btn" @click=${()=>this._set("columns",Math.min(6,(e.columns??1)+1))}>+</button>
          <input type="range" min="1" max="6" step="1" style="flex:1;margin-left:8px"
            .value=${String(e.columns??1)}
            @input=${e=>this._set("columns",parseInt(e.target.value,10))}/>
        </div>
      </div>`,i=V`
      <div class="preview-label">Live preview</div>
      <div class="tile-preview">
        <div class="tile-preview-hdr">
          <div style="display:flex;align-items:center;gap:6px">
            <div class="tp-dot"></div>
            <span style="font-size:12px;font-weight:600">Ljós yfir vaska</span>
          </div>
          <span class="tp-tog">ON</span>
        </div>
        <div class="tp-chips">
          <span class="tp-chip">235 V</span>
          <span class="tp-chip">44.6 °C</span>
          <span class="tp-chip">Good −54 dBm</span>
        </div>
        <div class="tp-graph">
          <svg viewBox="0 0 200 30" preserveAspectRatio="none" width="100%" height="100%">
            <polygon points="0,25 20,22 40,24 60,18 80,20 100,14 120,16 140,12 160,8 180,10 200,6 200,30 0,30" fill="#f4601e" fill-opacity="0.18"/>
            <polyline points="0,25 20,22 40,24 60,18 80,20 100,14 120,16 140,12 160,8 180,10 200,6" fill="none" stroke="#f4601e" stroke-width="1.2"/>
          </svg>
        </div>
        <div class="tp-bot">
          <span class="tp-power">4.1 W</span>
          <div style="display:flex;gap:4px">
            <span class="tp-badge" style="background:rgba(234,179,8,.2);color:#fde047">Dimmer</span>
            <span class="tp-badge" style="background:rgba(34,197,94,.2);color:#86efac">G3</span>
          </div>
        </div>
      </div>
      <div class="field-lbl" style="margin-bottom:8px">Drag to reorder · eye to hide</div>
      <div class="drag-list">
        ${this._dragOrder.map(e=>{const t=et.find(t=>t.id===e);if(!t)return q;const i=this._hiddenBlocks.has(e),o=this._dragOver===e;return V`
            <div class="drag-item ${i?"hidden-item":""} ${o?"drag-over":""}"
              draggable="true"
              @dragstart=${t=>{t.dataTransfer.setData("text",e),t.dataTransfer.effectAllowed="move"}}
              @dragenter=${t=>{t.preventDefault(),this._dragOver=e}}
              @dragover=${e=>{e.preventDefault()}}
              @dragleave=${()=>{this._dragOver===e&&(this._dragOver=null)}}
              @drop=${t=>{t.preventDefault();const i=t.dataTransfer.getData("text");if(!i||i===e)return void(this._dragOver=null);const o=[...this._dragOrder],a=o.indexOf(i),r=o.indexOf(e);o.splice(a,1),o.splice(r,0,i),this._dragOrder=o,this._dragOver=null,this._set("tile_layout",o.filter(e=>!this._hiddenBlocks.has(e)))}}>
              <div class="drag-handle"><span></span><span></span><span></span></div>
              <div style="flex:1">
                <div class="drag-label">${t.label}</div>
                <div class="drag-sub">${t.sub}</div>
              </div>
              <button class="drag-eye" @click=${()=>{const t=new Set(this._hiddenBlocks);t.has(e)?t.delete(e):t.add(e),this._hiddenBlocks=t;const i=this._dragOrder.filter(e=>!t.has(e));this._set("tile_layout",i)}} style="opacity:${i?.35:1}">👁</button>
            </div>`})}
      </div>`;return V`
      ${this._sec("grid","⊟","rgba(45,212,191,0.1)","#2dd4bf","Grid",q,t)}
      ${this._sec("tileorder","↕","rgba(244,96,30,0.12)","#f4601e","Tile Block Order",V`<span class="tag-new">Drag</span>`,i)}`}_renderStyleTab(){const e=this._config,t=e.style??{},i=(e,i)=>this._set("style",{...t,[e]:i}),o=e=>{const i={...t};delete i[e],this._set("style",i)},a=(e,a,r)=>{const n=t[a]??r;return V`
        <div class="color-row">
          <div class="color-preview-swatch" style="background:${n}"></div>
          <span class="color-key">${e}</span>
          <input type="color" .value=${n}
            @change=${e=>i(a,e.target.value)}/>
          ${t[a]?V`<button class="color-reset" @click=${()=>o(a)}>↺</button>`:q}
        </div>`},r=V`
      <!-- Title -->
      <div class="field">
        <div class="field-lbl">Card title</div>
        <div style="display:flex;gap:6px">
          <input type="text" class="inline-text" placeholder="Shelly"
            .value=${e.title??""}
            @change=${e=>{const t=e.target.value.trim();this._set("title",t||void 0)}}
            style="flex:1"/>
          <input type="text" class="inline-text" placeholder="⚡" maxlength="4"
            title="Icon / emoji before title"
            .value=${t.header_icon??""}
            @change=${e=>{const t=e.target.value.trim();i("header_icon",t||void 0)}}
            style="width:48px;text-align:center;font-size:16px"/>
        </div>
      </div>
      <!-- Appearance sliders -->
      <div class="field">
        <div class="field-lbl">Title size — <span style="color:#f4601e">${(t.header_title_size??1.1).toFixed(1)}em</span></div>
        <input type="range" min="0.7" max="1.8" step="0.1" .value=${String(t.header_title_size??1.1)}
          @input=${e=>{const t=parseFloat(e.target.value);i("header_title_size",1.1===t?void 0:t)}}/>
      </div>
      <div class="field">
        <div class="field-lbl">Header height — <span style="color:#f4601e">${t.header_padding??16}px</span></div>
        <input type="range" min="6" max="40" step="2" .value=${String(t.header_padding??16)}
          @input=${e=>{const t=parseInt(e.target.value);i("header_padding",16===t?void 0:t)}}/>
      </div>
      <div class="field">
        <div class="field-lbl">Corner radius — <span style="color:#f4601e">${t.header_radius??0}px</span></div>
        <input type="range" min="0" max="24" step="2" .value=${String(t.header_radius??0)}
          @input=${e=>{const t=parseInt(e.target.value);i("header_radius",0===t?void 0:t)}}/>
      </div>
      <!-- Bottom border/separator -->
      <div class="field">
        <div class="field-lbl">Bottom border — <span style="color:#f4601e">${t.header_border_width??0}px</span></div>
        <input type="range" min="0" max="6" step="1" .value=${String(t.header_border_width??0)}
          @input=${e=>{const t=parseInt(e.target.value);i("header_border_width",0===t?void 0:t)}}/>
      </div>
      ${(t.header_border_width??0)>0?a("Border color","header_border_color","#4ade80"):q}
      <!-- Visibility toggles -->
      <div class="tog-row" style="border:none;padding:4px 0 0">
        <div class="tog-lbl">Show title</div>
        <label class="sw"><input type="checkbox" .checked=${!1!==e.header_show_title}
          @change=${e=>this._set("header_show_title",!!e.target.checked&&void 0)}>
          <span class="sw-t"></span><span class="sw-b"></span></label>
      </div>
      <div class="tog-row" style="border:none;padding:4px 0 0">
        <div class="tog-lbl">Show stats (online / power)</div>
        <label class="sw"><input type="checkbox" .checked=${!1!==e.header_show_stats}
          @change=${e=>this._set("header_show_stats",!!e.target.checked&&void 0)}>
          <span class="sw-t"></span><span class="sw-b"></span></label>
      </div>
      <div class="tog-row" style="border:none;padding:4px 0 0">
        <div class="tog-lbl">Show cloud chips</div>
        <label class="sw"><input type="checkbox" .checked=${!1!==e.header_show_cloud}
          @change=${e=>this._set("header_show_cloud",!!e.target.checked&&void 0)}>
          <span class="sw-t"></span><span class="sw-b"></span></label>
      </div>
      <div class="tog-row" style="border:none;padding:4px 0 0">
        <div class="tog-lbl">Show glow orbs</div>
        <label class="sw"><input type="checkbox" .checked=${!1!==e.header_show_orbs}
          @change=${e=>this._set("header_show_orbs",!!e.target.checked&&void 0)}>
          <span class="sw-t"></span><span class="sw-b"></span></label>
      </div>
      <!-- Background colors -->
      ${a("Background gradient start","header_bg","#1a1a2e")}
      ${a("Background gradient end","header_bg2","#0f3460")}
      ${a("Text color","header_text_color","#ffffff")}
      ${a("Orb / glow color","header_orb_color","#3b82f6")}
      <!-- Stat chip colors -->
      ${a("Online chip color","header_stat_online","#4ade80")}
      ${a("Power chip color","header_stat_power","#fb923c")}
      ${a("Offline chip color","header_stat_offline","#9ca3af")}
      <!-- Opacity -->
      <div class="field">
        <div class="field-lbl">Background opacity — <span style="color:#f4601e">${e.header_opacity??100}%</span></div>
        <input type="range" min="0" max="100" step="5" .value=${String(e.header_opacity??100)}
          @input=${e=>{const t=parseInt(e.target.value);this._set("header_opacity",100===t?void 0:t)}}/>
      </div>`,n=(e,i,o)=>{const a=t[i]??o;return V`
        <div class="color-row">
          <div class="color-preview-swatch" style="background:${a}"></div>
          <span class="color-key">${e}</span>
          <input type="color" .value=${a}
            @change=${e=>this._set("style",{...t,[i]:e.target.value})}/>
          ${t[i]?V`<button class="color-reset" @click=${()=>{const e={...t};delete e[i],this._set("style",e)}}>↺</button>`:q}
        </div>`},s=V`
      ${n("Dashboard BG","card_bg","#1c1c1e")}
      ${n("Accent / brand","accent_color","#f4601e")}
      ${n("Room header label","area_header_color","#f4601e")}
      ${n("Tile background","tile_bg","#1c1c1e")}
      ${n("Tile border","tile_border","#2a2a30")}
      ${n("Tile hover BG","tile_hover_bg","rgba(255,255,255,0.07)")}
      ${n("Tile hover shadow","tile_hover_shadow","rgba(0,0,0,0.30)")}
      ${n("Sensor chip BG","tile_sensor_bg","rgba(255,255,255,0.04)")}
      ${n("Expanded panel BG","tile_exp_bg","rgba(255,255,255,0.06)")}
      ${n("Text primary","text_primary","#e5e7eb")}
      ${n("Text secondary","text_secondary","#9ca3af")}
      ${n("Text muted","text_muted","#6b7280")}
      ${n("Online dot","online_color","#4ade80")}
      ${n("Offline dot","offline_color","#ef4444")}
      ${n("Power reading","power_color","#fb923c")}`,l=V`
      <div class="field">
        <div class="field-lbl">Font family</div>
        <div class="pill-grp">
          ${Xe.map(e=>V`
            <span class="pill ${(t.font_family??void 0)===e.value?"on":""}"
              @click=${()=>{if(void 0===e.value){const{font_family:e,...i}=t;this._set("style",Object.keys(i).length?i:void 0)}else this._set("style",{...t,font_family:e.value})}}>${e.label}</span>`)}
        </div>
      </div>
      <div class="field">
        <div class="field-lbl">Area label style</div>
        <div class="pill-grp">
          ${["uppercase","capitalize","none"].map(e=>V`
            <span class="pill ${(t.text_transform??"uppercase")===e?"on":""}"
              @click=${()=>this._set("style",{...t,text_transform:e})}>${e}</span>`)}
        </div>
      </div>
      <div class="field">
        <div class="field-lbl">Text scale — <span style="color:#f4601e">${(t.text_size_scale??1).toFixed(2)}×</span></div>
        <input type="range" min="0.8" max="1.3" step="0.05" .value=${String(t.text_size_scale??1)}
          @input=${e=>this._set("style",{...t,text_size_scale:parseFloat(e.target.value)})}/>
      </div>
      </div>`,c=t.button_shape??"pill",d=t.button_variant??"fill",p=t.button_size??"md",u="square"===c||"circle"===c,h=`border-radius:${"pill"===c?"20px":"rect"===c||"square"===c?"6px":"50%"};padding:${u?"sm"===p?"3px 5px":"lg"===p?"6px 12px":"4px 8px":"sm"===p?"2px 8px":"lg"===p?"6px 16px":"4px 12px"};font-size:${"sm"===p?"10px":"lg"===p?"13px":"11px"};aspect-ratio:${u?"1":"auto"};display:inline-flex;align-items:center;justify-content:center;`,g=V`
      <div class="btn-preview">
        <span class="preview-btn on" style="${h}${"outline"===d?"background:transparent;color:var(--accent);border:1px solid var(--accent);box-shadow:none":"ghost"===d?"background:transparent;color:var(--accent);border:none;box-shadow:none":"background:var(--accent);color:white;border:none"}">ON</span>
        <span class="preview-btn off" style="${h}">OFF</span>
      </div>
      <div class="field">
        <div class="field-lbl">Shape</div>
        <div class="pill-grp">
          ${["pill","rect","square","circle"].map(e=>V`
            <span class="pill ${(t.button_shape??"pill")===e?"on":""}" @click=${()=>this._set("style",{...t,button_shape:e})}>${e[0].toUpperCase()+e.slice(1)}</span>`)}
        </div>
      </div>
      <div class="field">
        <div class="field-lbl">Variant</div>
        <div class="pill-grp">
          ${["fill","outline","ghost"].map(e=>V`
            <span class="pill ${(t.button_variant??"fill")===e?"on":""}" @click=${()=>this._set("style",{...t,button_variant:e})}>${e[0].toUpperCase()+e.slice(1)}</span>`)}
        </div>
      </div>
      <div class="field">
        <div class="field-lbl">Size</div>
        <div class="pill-grp">
          ${["sm","md","lg"].map((e,i)=>V`
            <span class="pill ${(t.button_size??"md")===e?"on":""}" @click=${()=>this._set("style",{...t,button_size:e})}>${["Small","Medium","Large"][i]}</span>`)}
        </div>
      </div>`,f=e.card_opacity??100,v=e.tile_opacity??100,b=t.tile_bg??"rgba(255,255,255,0.04)",m=t.card_bg??"#1c1c1e",x=t.tile_radius??12,y=t.tile_border??"rgba(255,255,255,0.07)",_=e.card_bg_image?`url('${e.card_bg_image}')`:"none",w="stretch"===e.card_bg_image_size?"100% 100%":e.card_bg_image_size??"cover",$=v<100?`color-mix(in srgb, ${b} ${v}%, transparent)`:b,k=V`
      <div class="preview-label">Live preview</div>
      <div class="transp-preview" style="background-color:${m};background-image:${_};background-size:${w};background-position:center;">
        <div class="transp-card-layer" style="background-color:${f<100?`color-mix(in srgb, ${m} ${f}%, transparent)`:m};">
          ${[0,1,2].map(e=>V`
            <div class="transp-tile" style="background-color:${$};border-radius:${x}px;border:1px solid ${y};">
              <div class="transp-tile-name">Device ${e+1}</div>
              <div class="transp-tile-chips">
                <div class="transp-chip"></div>
                <div class="transp-chip"></div>
              </div>
            </div>`)}
        </div>
      </div>

      <div class="field">
        <div class="field-lbl">Tile size</div>
        <div class="pill-grp">
          ${["sm","md","lg"].map((t,i)=>V`
            <span class="pill ${(e.tile_size??"md")===t?"on":""}" @click=${()=>this._set("tile_size",t)}>${["Small","Medium","Large"][i]}</span>`)}
        </div>
      </div>
      <div class="field">
        <div class="field-lbl">Tile gap — <span style="color:#f4601e">${t.tile_gap??10}px</span></div>
        <input type="range" min="4" max="24" step="2" .value=${String(t.tile_gap??10)}
          @input=${e=>this._set("style",{...t,tile_gap:parseInt(e.target.value,10)})}/>
      </div>
      <div class="field">
        <div class="field-lbl">Tile radius — <span style="color:#f4601e">${t.tile_radius??12}px</span></div>
        <input type="range" min="0" max="24" .value=${String(t.tile_radius??12)}
          @input=${e=>this._set("style",{...t,tile_radius:parseInt(e.target.value,10)})}/>
      </div>
      <div class="field">
        <div class="field-lbl">Tile border width — <span style="color:#f4601e">${t.tile_border_width??1}px</span></div>
        <input type="range" min="0" max="4" step="1" .value=${String(t.tile_border_width??1)}
          @input=${e=>{const i=parseInt(e.target.value);this._set("style",{...t,tile_border_width:1===i?void 0:i})}}/>
      </div>
      <div class="field">
        <div class="field-lbl">Tile shadow</div>
        <div class="pill-grp">
          ${["none","soft","medium","strong"].map(e=>V`
            <span class="pill ${(t.tile_box_shadow??"none")===e?"on":""}"
              @click=${()=>this._set("style",{...t,tile_box_shadow:"none"===e?void 0:e})}>
              ${e[0].toUpperCase()+e.slice(1)}</span>`)}
        </div>
      </div>
      <div class="field">
        <div class="field-lbl">Card corner radius — <span style="color:#f4601e">${t.card_radius??12}px</span></div>
        <input type="range" min="0" max="32" step="2" .value=${String(t.card_radius??12)}
          @input=${e=>{const i=parseInt(e.target.value);this._set("style",{...t,card_radius:12===i?void 0:i})}}/>
      </div>

      <div class="tiles-divider">Transparency</div>
      <div class="field">
        <div class="field-lbl">Card — <span style="color:#f4601e">${100-f}%</span></div>
        <input type="range" min="0" max="100" .value=${String(100-f)}
          @input=${e=>this._set("card_opacity",100-parseInt(e.target.value,10))}/>
      </div>
      <div class="field">
        <div class="field-lbl">Tiles — <span style="color:#f4601e">${100-v}%</span></div>
        <input type="range" min="0" max="100" .value=${String(100-v)}
          @input=${e=>this._set("tile_opacity",100-parseInt(e.target.value,10))}/>
      </div>

      <div class="tiles-divider">Backgrounds</div>
      <div class="field">
        <div class="field-lbl">Card background image</div>
        <div class="bg-img-row">
          <input type="file" accept="image/*" hidden data-upload="card-bg"
            @change=${e=>this._handleCardBgUpload(e)}/>
          <button class="upload-btn" @click=${()=>{this.renderRoot.querySelector('input[data-upload="card-bg"]')?.click()}}>↑ Local</button>
          <input type="text" class="inline-text" placeholder="/local/image.png or https://…"
            .value=${e.card_bg_image?.startsWith("data:")?"(embedded)":e.card_bg_image??""}
            @change=${e=>{const t=e.target.value.trim();t&&"(embedded)"!==t?this._set("card_bg_image",t):this._set("card_bg_image",void 0)}}/>
          ${e.card_bg_image?V`<button class="color-reset" @click=${()=>{const e={...this._config};delete e.card_bg_image,delete e.card_bg_image_size,Qe(this,"config-changed",{config:e})}}>↺</button>`:q}
        </div>
        ${e.card_bg_image?V`
          <div class="field-lbl" style="margin-top:6px">Image fit</div>
          <div class="pill-grp">
            ${["cover","contain","stretch"].map(t=>V`
              <span class="pill ${(e.card_bg_image_size??"cover")===t?"on":""}"
                @click=${()=>this._set("card_bg_image_size",t)}>${t[0].toUpperCase()+t.slice(1)}</span>`)}
          </div>
        `:q}
      </div>
      <div class="field">
        <div class="field-lbl">Tile background image</div>
        <div class="bg-img-row">
          <input type="file" accept="image/*" hidden data-upload="tile-bg"
            @change=${e=>this._handleTileBgUpload(e)}/>
          <button class="upload-btn" @click=${()=>{this.renderRoot.querySelector('input[data-upload="tile-bg"]')?.click()}}>↑ Local</button>
          <input type="text" class="inline-text" placeholder="/local/image.png or https://…"
            .value=${t.tile_bg_image?.startsWith("data:")?"(embedded)":t.tile_bg_image??""}
            @change=${e=>{const i=e.target.value.trim(),o={...t};i&&"(embedded)"!==i?o.tile_bg_image=i:delete o.tile_bg_image,this._set("style",Object.keys(o).length?o:void 0)}}/>
          ${t.tile_bg_image?V`<button class="color-reset" @click=${()=>{const e={...t};delete e.tile_bg_image,delete e.tile_bg_image_size,this._set("style",Object.keys(e).length?e:void 0)}}>↺</button>`:q}
        </div>
        ${t.tile_bg_image?V`
          <div class="field-lbl" style="margin-top:6px">Image fit</div>
          <div class="pill-grp">
            ${["cover","contain","stretch"].map(e=>V`
              <span class="pill ${(t.tile_bg_image_size??"cover")===e?"on":""}"
                @click=${()=>this._set("style",{...t,tile_bg_image_size:e})}>${e[0].toUpperCase()+e.slice(1)}</span>`)}
          </div>
        `:q}
      </div>`,C=this._getAreas(),S=Object.keys(e.area_styles??{}).length,A=V`
      ${0===C.length?V`<div class="field-hint">No rooms configured in Home Assistant.</div>`:C.map(t=>{const i=this._expandedRooms.has(t.name),o=!(!e.area_styles?.[t.name]||!Object.keys(e.area_styles[t.name]).length),a=e.area_styles?.[t.name]??{},r=[a.bgColor,a.headerBgColor,a.tileBgColor,a.accentColor].filter(Boolean);return V`
            <div class="room-style-row">
              <div class="room-style-hdr" @click=${()=>{const e=new Set(this._expandedRooms);e.has(t.name)?e.delete(t.name):e.add(t.name),this._expandedRooms=e}}>
                <span class="room-style-name">${t.name}</span>
                ${r.length?V`
                  <div class="room-swatch-strip">
                    ${r.map(e=>V`<span class="room-swatch" style="background:${e}"></span>`)}
                  </div>`:q}
                ${o&&!r.length?V`<span class="room-styled-dot"></span>`:q}
                <span class="room-style-chev">${i?"▲":"▼"}</span>
              </div>
              ${i?this._renderRoomStyleInline(t.name):q}
            </div>`})}`;return V`
      <div class="style-toolbar">
        <button class="btn-copy ${this._copyAreaOpen?"active":""}" @click=${()=>{this._copyStyle()}}>⧉ Copy style</button>
        <button class="btn-copy ${this._pasteOpen?"active":""}" @click=${()=>{this._pasteOpen=!this._pasteOpen,this._copyAreaOpen=!1}}>⬇ Paste style</button>
        ${this._styleClipFeedback?V`<span class="clip-feedback">${this._styleClipFeedback}</span>`:q}
      </div>
      ${this._copyAreaOpen?V`
        <div class="paste-area">
          <div style="font-size:10px;color:var(--t2);margin-bottom:2px">Select all and copy (Ctrl+A, Ctrl+C), then paste into another card's Paste style box</div>
          <textarea class="paste-ta" rows="3" readonly
            .value=${this._copyJson}
            @focus=${e=>{e.target.select()}}></textarea>
        </div>`:q}
      ${this._pasteOpen?V`
        <div class="paste-area">
          <div style="font-size:10px;color:var(--t2);margin-bottom:2px">Paste style JSON, then click Apply</div>
          <textarea class="paste-ta" rows="3" placeholder="Paste style JSON here…"
            .value=${this._pasteText}
            @input=${e=>{this._pasteText=e.target.value}}></textarea>
          <button class="btn-copy" @click=${()=>this._applyPastedStyle()}>Apply</button>
        </div>`:q}
      ${this._sec("header","◈","rgba(99,102,241,0.1)","#818cf8","Header",q,r)}
      ${this._sec("colors","◐","rgba(244,96,30,0.12)","#f4601e","Colors",q,s)}
      ${this._sec("tiles","⊡","rgba(45,212,191,0.1)","#2dd4bf","Tiles",q,k)}
      ${this._sec("typography","T","rgba(251,191,36,0.1)","#fbbf24","Typography",q,l)}
      ${this._sec("buttons","⬭","rgba(74,222,128,0.1)","#4ade80","Buttons",q,g)}
      ${this._sec("roomstyles","⌂","rgba(74,222,128,0.08)","#4ade80","Per-Room Styles",S?this._badge(`${S} styled`,"#4ade80","rgba(74,222,128,0.1)"):q,A)}`}_renderGraphsTab(){const e=this._config,t=e.graph_style??{},i=t.type??"line",o=e.graph_sensor_colors??{},a=V`
      <div class="field">
        <div class="field-lbl">Type</div>
        <div class="pill-grp">
          ${["line","area","bar"].map(e=>V`
            <span class="pill ${i===e?"on":""}" @click=${()=>this._set("graph_style",{...t,type:e})}>${e[0].toUpperCase()+e.slice(1)}</span>`)}
        </div>
      </div>
      <div class="field" style="opacity:${"bar"===i?.4:1}">
        <div class="field-lbl">Line thickness — <span style="color:#f4601e">${t.line_width??1.5}px</span></div>
        <input type="range" min="0.5" max="4" step="0.5" ?disabled=${"bar"===i} .value=${String(t.line_width??1.5)}
          @input=${e=>this._set("graph_style",{...t,line_width:parseFloat(e.target.value)})}/>
      </div>
      <div class="tog-row">
        <div class="tog-lbl">Fill area under line</div>
        <label class="sw"><input type="checkbox" .checked=${!1!==t.fill} @change=${e=>this._set("graph_style",{...t,fill:e.target.checked})}><span class="sw-t"></span><span class="sw-b"></span></label>
      </div>
      <div class="field">
        <div class="field-lbl">Graph height — <span style="color:#f4601e">${t.height??32}px</span></div>
        <input type="range" min="20" max="80" step="4" .value=${String(t.height??32)}
          @input=${e=>this._set("graph_style",{...t,height:parseInt(e.target.value,10)})}/>
      </div>
      <div class="field">
        <div class="field-lbl">History window — <span style="color:#f4601e">${e.graph_hours??24}h</span></div>
        <input type="range" min="1" max="168" step="1" .value=${String(e.graph_hours??24)}
          @input=${e=>this._set("graph_hours",parseInt(e.target.value,10))}/>
      </div>
      <div class="tog-row">
        <div class="tog-lbl">Show time axis labels</div>
        <label class="sw"><input type="checkbox" .checked=${!1!==t.time_labels} @change=${e=>this._set("graph_style",{...t,time_labels:e.target.checked})}><span class="sw-t"></span><span class="sw-b"></span></label>
      </div>
      <div class="tog-row">
        <div class="tog-lbl">Show peak / min dots</div>
        <label class="sw"><input type="checkbox" .checked=${!1!==t.show_dots} @change=${e=>this._set("graph_style",{...t,show_dots:e.target.checked})}><span class="sw-t"></span><span class="sw-b"></span></label>
      </div>
      <div class="tog-row">
        <div class="tog-lbl">Tick grid lines</div>
        <label class="sw"><input type="checkbox" .checked=${!1!==t.tick_lines} @change=${e=>this._set("graph_style",{...t,tick_lines:e.target.checked})}><span class="sw-t"></span><span class="sw-b"></span></label>
      </div>`,r=e.graph_sensors??[],n=r.length?V`
      ${r.map(e=>{const t=Ke.find(t=>t.key===e),i=(e=>o[e]??Ke.find(t=>t.key===e)?.color??"#f4601e")(e),a=!!o[e];return V`
          <div class="color-row">
            <div class="color-preview-swatch" style="background:${i}"></div>
            <span class="color-key">${t?.label??e}</span>
            <input type="color" .value=${i}
              @change=${t=>{const i=t.target.value;this._set("graph_sensor_colors",{...o,[e]:i})}}/>
            ${a?V`<button class="color-reset" @click=${()=>{const t={...o};delete t[e],this._set("graph_sensor_colors",Object.keys(t).length?t:void 0)}}>↺</button>`:q}
          </div>`})}
      <div class="field" style="margin-top:10px">
        <div class="field-lbl">Which sensors to graph</div>
        <div class="pill-grp">
          ${Ke.map(e=>V`
            <span class="pill ${r.includes(e.key)?"on":""}" @click=${()=>{const t=r.includes(e.key)?r.filter(t=>t!==e.key):[...r,e.key];this._set("graph_sensors",t)}}>${e.label}</span>`)}
        </div>
      </div>`:V`<div class="empty-hint">No graph sensors selected yet. Add them in the Sensors tab or here:</div>
      <div class="pill-grp" style="margin-top:8px">
        ${Ke.map(t=>V`
          <span class="pill" @click=${()=>this._set("graph_sensors",[...e.graph_sensors??[],t.key])}>${t.label}</span>`)}
      </div>`;return V`
      ${this._sec("graphtype","∿","rgba(45,212,191,0.1)","#2dd4bf","Graph Type",q,a)}
      ${this._sec("graphcolors","◐","rgba(244,96,30,0.12)","#f4601e","Per-sensor Colors",q,n)}`}_renderSensorsTab(){const e=this._config,t=e.sensors??[];return V`
      ${Je.map(i=>{const o=i.items.map(e=>e.key),a=o.filter(e=>t.includes(e)).length,r=o.every(e=>t.includes(e)),n=this._badge(`${a||"All"} / ${i.items.length}`,i.iconColor,i.iconBg),s=V`
          <div class="sensors-hdr">
            <span class="sensors-hdr-lbl">${0===a?"All shown (default)":`${a} of ${i.items.length} shown`}</span>
            <button class="sensors-all-btn" @click=${e=>{e.stopPropagation();const i=r?t.filter(e=>!o.includes(e)):[...new Set([...t,...o])];this._set("sensors",i)}}>${r?"− Deselect all":"+ Select all"}</button>
          </div>
          <div class="sensor-grid">
            ${i.items.map(i=>{const o=t.includes(i.key),a=!!Ke.find(e=>e.key===i.key),r=e.graph_sensors??[],n=r.includes(i.key);return V`
                <div class="sensor-item ${o?"active":""}" @click=${()=>{const e=o?t.filter(e=>e!==i.key):[...t,i.key];this._set("sensors",e)}}>
                  <div class="sensor-dot" style="background:${o?i.defaultColor:"var(--t3)"}"></div>
                  <div class="sensor-item-body">
                    <span class="sensor-name">${i.label}</span>
                    ${i.unit?V`<span class="sensor-unit">${i.unit}</span>`:q}
                  </div>
                  ${a?V`<button class="sensor-graph-btn ${n?"on":""}"
                    title="${n?"Remove from graphs":"Add to graphs"}"
                    @click=${e=>{e.stopPropagation();const t=n?r.filter(e=>e!==i.key):[...r,i.key];this._set("graph_sensors",t)}}>∿</button>`:q}
                </div>`})}
          </div>`;return this._sec(i.group.toLowerCase().replace(" ",""),i.icon,i.iconBg,i.iconColor,i.group,n,s)})}`}_renderYamlTab(){const e=this._config,t=(e,i=0)=>{const o="  ".repeat(i);return Object.entries(e).map(([e,a])=>null==a?"":"object"!=typeof a||Array.isArray(a)?Array.isArray(a)?`${o}${e}:\n${a.map(e=>"object"==typeof e?`${o}  -\n${t(e,i+2)}`:`${o}  - ${e}`).join("\n")}`:`${o}${e}: ${a}`:`${o}${e}:\n${t(a,i+1)}`).filter(Boolean).join("\n")},i=t(e);return V`
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
        <div style="font-size:11px;color:#50505c;font-family:monospace">Generated config</div>
        <button class="btn-copy" @click=${async()=>{await navigator.clipboard.writeText(i).catch(e=>{console.warn("[editor] clipboard write failed",e)})}}>Copy</button>
      </div>
      <pre class="yaml-out">${i}</pre>`}render(){if(!this._config)return V``;this._config;return V`
      <div class="shell">
        <div class="tab-nav">
          ${[{id:"devices",label:"Rooms",icon:"⌂"},{id:"layout",label:"Layout & Style",icon:"⊡"},{id:"graphs",label:"Graphs & Sensors",icon:"∿"},{id:"yaml",label:"YAML",icon:"</>"}].map(e=>V`
            <div class="tab ${this._tab===e.id?"active":""}" @click=${()=>{this._tab=e.id}}>
              <span class="tab-icon">${e.icon}</span>${e.label}
            </div>`)}
        </div>
        <div class="tab-body">
          ${"devices"===this._tab?this._renderDevicesTab():"layout"===this._tab?V`${this._renderLayoutTab()}${this._renderStyleTab()}`:"graphs"===this._tab?V`${this._renderGraphsTab()}${this._renderSensorsTab()}`:this._renderYamlTab()}
        </div>
      </div>`}};it.styles=[Ve,n`
    :host { display:block; font-family:'DM Sans',sans-serif; }
    * { box-sizing:border-box; }

    /* ── CSS vars ── */
    .shell {
      --bg:#0f0f12; --s1:#17171c; --s2:#1e1e26; --s3:#25252f;
      --border:rgba(255,255,255,0.07); --border2:rgba(255,255,255,0.12);
      --text:#e2e2e8; --t2:#888896; --t3:#555560;
      --accent:#f4601e; --accentbg:rgba(244,96,30,0.12); --accentbdr:rgba(244,96,30,0.3);
      --blue:#4a9eff; --green:#4ade80; --purple:#a78bfa; --teal:#2dd4bf; --amber:#fbbf24;
      background:var(--bg); color:var(--text); border-radius:8px; overflow:hidden;
    }

    /* ── Tab nav ── */
    .tab-nav { display:flex; gap:2px; padding:10px 16px 0; border-bottom:1px solid var(--border); background:var(--s1); overflow-x:auto; }
    .tab-nav::-webkit-scrollbar { height:0; }
    .tab { font-size:11px; font-weight:500; letter-spacing:0.05em; text-transform:uppercase; padding:8px 14px; color:var(--t3); cursor:pointer; border-bottom:2px solid transparent; white-space:nowrap; transition:all .15s; border-radius:5px 5px 0 0; user-select:none; display:flex; align-items:center; }
    .tab:hover { color:var(--t2); }
    .tab.active { color:var(--accent); border-bottom-color:var(--accent); }
    .tab-icon { margin-right:5px; font-size:10px; opacity:0.7; }
    .tab-body { padding:14px; background:var(--bg); max-height:70vh; overflow-y:auto; }
    .tab-body::-webkit-scrollbar { width:3px; }
    .tab-body::-webkit-scrollbar-thumb { background:var(--s3); border-radius:2px; }

    /* ── Section accordion ── */
    .sec { border:1px solid var(--border); border-radius:12px; overflow:hidden; margin-bottom:6px; }
    .sec-hdr { display:flex; align-items:center; justify-content:space-between; padding:11px 14px; cursor:pointer; user-select:none; background:var(--s2); transition:background .12s; }
    .sec-hdr:hover { background:var(--s3); }
    .sec-hdr-l { display:flex; align-items:center; gap:9px; }
    .sec-ico { width:22px; height:22px; border-radius:5px; display:flex; align-items:center; justify-content:center; font-size:11px; flex-shrink:0; }
    .sec-title { font-size:12px; font-weight:600; letter-spacing:0.04em; text-transform:uppercase; color:var(--text); }
    .sec-hdr-r { display:flex; align-items:center; gap:8px; }
    .sec-badge { font-size:10px; font-weight:600; padding:2px 7px; border-radius:10px; }
    .chev { font-size:10px; color:var(--t3); transition:transform .2s; }
    .sec.open .chev { transform:rotate(180deg); }
    .sec-body { display:none; padding:14px; border-top:1px solid var(--border); background:var(--bg); }
    .sec.open .sec-body { display:block; }

    /* ── Field labels ── */
    .field { margin-bottom:12px; }
    .field:last-child { margin-bottom:0; }
    .field-lbl { font-size:11px; font-weight:600; letter-spacing:0.04em; color:var(--t2); text-transform:uppercase; margin-bottom:7px; }
    .field-note { font-size:9px; font-weight:400; color:var(--t3); text-transform:none; letter-spacing:0; float:right; }
    .field-hint { font-size:10px; color:var(--t3); margin-top:4px; }
    .empty-hint { font-size:11px; color:var(--t3); font-style:italic; }
    .divider { height:1px; background:var(--border); margin:10px 0; }
    .preview-label { font-size:10px; font-weight:600; letter-spacing:0.06em; text-transform:uppercase; color:var(--t3); margin-bottom:6px; }

    /* ── Range inputs ── */
    input[type="range"] { width:100%; accent-color:var(--accent); cursor:pointer; }
    input[type="text"] { background:var(--s2); border:1px solid var(--border2); border-radius:8px; padding:7px 11px; font-size:12px; color:var(--text); outline:none; width:100%; }
    input[type="text"]:focus { border-color:var(--accent); }
    input[type="checkbox"] { accent-color:var(--accent); cursor:pointer; }

    /* ── Toggle switch ── */
    .sw { position:relative; width:36px; height:20px; flex-shrink:0; display:inline-block; cursor:pointer; }
    .sw input { opacity:0; width:0; height:0; }
    .sw-t { position:absolute; inset:0; background:var(--s3); border-radius:10px; border:1px solid var(--border2); transition:background .2s,border-color .2s; cursor:pointer; }
    .sw-b { position:absolute; top:2px; left:2px; width:14px; height:14px; background:var(--t3); border-radius:50%; transition:transform .2s,background .2s; pointer-events:none; }
    .sw input:checked ~ .sw-t { background:var(--accentbg); border-color:var(--accentbdr); }
    .sw input:checked ~ .sw-b { transform:translateX(16px); background:var(--accent); }

    /* ── Toggle row ── */
    .tog-row { display:flex; align-items:center; justify-content:space-between; padding:8px 0; border-bottom:1px solid var(--border); }
    .tog-row:last-child { border-bottom:none; }
    .tog-lbl { font-size:13px; color:var(--text); }
    .tog-sub { font-size:11px; color:var(--t3); margin-top:2px; }

    /* ── Pill group ── */
    .pill-grp { display:flex; flex-wrap:wrap; gap:6px; }
    .pill { font-size:11px; font-weight:500; padding:4px 11px; border-radius:20px; border:1px solid var(--border2); color:var(--t2); cursor:pointer; transition:all .15s; user-select:none; background:var(--s2); }
    .pill:hover { border-color:var(--accent); color:var(--accent); }
    .pill.on { background:var(--accentbg); border-color:var(--accentbdr); color:var(--accent); }

    /* ── Color row ── */
    .color-row { display:flex; align-items:center; gap:8px; padding:7px 0; border-bottom:1px solid var(--border); }
    .color-row:last-child { border-bottom:none; }
    .color-key { font-size:12px; color:var(--t2); flex:1; min-width:0; }
    .color-val { font-family:monospace; font-size:10px; color:var(--t3); min-width:60px; text-align:right; }
    .color-reset { font-size:11px; color:var(--t3); background:none; border:none; cursor:pointer; padding:2px 4px; border-radius:3px; transition:color .15s; }
    .color-reset:hover { color:var(--accent); }
    input[type="color"] { width:36px; height:28px; border:1px solid var(--border2); border-radius:5px; padding:2px 3px; background:var(--s2); cursor:pointer; flex-shrink:0; }
    .color-preview-swatch { width:20px; height:20px; border-radius:4px; border:1px solid rgba(255,255,255,0.2); flex-shrink:0; }
    .sl-row { display:flex; align-items:center; gap:8px; padding:7px 0; border-bottom:1px solid var(--border); }
    .sl-row:last-child { border-bottom:none; }
    .sl-val { font-family:monospace; font-size:11px; color:var(--accent); min-width:36px; text-align:right; }
    .inline-text { flex:1; background:var(--s2); border:1px solid var(--border2); border-radius:6px; padding:4px 8px; font-size:11px; color:var(--text); outline:none; min-width:0; }
    .bg-img-row { display:flex; align-items:center; gap:6px; }
    .transp-preview { border-radius:10px; overflow:hidden; margin-bottom:12px; }
    .transp-card-layer { display:grid; grid-template-columns:repeat(3,1fr); gap:8px; padding:12px; min-height:140px; }
    .transp-tile { display:flex; flex-direction:column; gap:6px; padding:8px; }
    .transp-tile-name { height:10px; border-radius:4px; background:rgba(255,255,255,0.18); width:70%; }
    .transp-tile-chips { display:flex; gap:4px; }
    .transp-chip { height:8px; border-radius:3px; background:rgba(255,255,255,0.10); flex:1; }
    .tiles-divider { font-size:10px; font-weight:600; color:var(--t2); letter-spacing:.06em; text-transform:uppercase; margin:12px 0 6px; padding-top:10px; border-top:1px solid var(--border); }
    .upload-btn { font-size:10px; background:var(--s2); border:1px solid var(--border2); border-radius:5px; color:var(--text); padding:3px 8px; cursor:pointer; white-space:nowrap; }

    /* ── Rooms toolbar ── */
    .rooms-toolbar { display:flex; flex-direction:column; gap:6px; margin-bottom:10px; padding-bottom:10px; border-bottom:1px solid var(--border); }
    .toolbar-group { display:flex; align-items:center; gap:8px; }
    .toolbar-lbl { font-size:11px; color:var(--t3); min-width:34px; }

    /* ── Room rows ── */
    .room-row { display:flex; align-items:center; gap:10px; padding:8px 0; border-bottom:1px solid var(--border); }
    .room-row:last-of-type { border-bottom:none; }
    .room-dot { width:8px; height:8px; border-radius:50%; flex-shrink:0; }
    .room-name { font-size:13px; flex:1; }
    .room-count { font-size:10px; color:var(--t3); background:var(--s3); padding:2px 7px; border-radius:10px; }
    .room-style-btn { background:none; border:1px solid var(--border); color:var(--t3); border-radius:5px; font-size:10px; padding:3px 8px; cursor:pointer; transition:all .12s; flex-shrink:0; }
    .room-style-btn:hover { border-color:var(--accent); color:var(--accent); }
    .room-style-row { border-bottom:1px solid var(--border); }
    .room-style-row:last-child { border-bottom:none; }
    .room-style-hdr { display:flex; align-items:center; gap:8px; padding:8px 4px; cursor:pointer; user-select:none; }
    .room-style-hdr:hover { background:rgba(255,255,255,0.03); border-radius:6px; }
    .room-style-name { flex:1; font-size:12px; color:var(--text); font-weight:500; }
    .room-styled-dot { width:6px; height:6px; border-radius:50%; background:var(--accent); flex-shrink:0; }
    .room-swatch-strip { display:flex; gap:3px; align-items:center; }
    .room-swatch { width:12px; height:12px; border-radius:3px; border:1px solid rgba(255,255,255,0.15); flex-shrink:0; }
    .room-style-chev { font-size:9px; color:var(--t3); }
    .room-devices { padding:4px 0 4px 12px; border-bottom:1px solid var(--border); }
    .room-device-row { display:flex; align-items:center; gap:8px; padding:5px 0; border-bottom:1px solid rgba(255,255,255,0.04); }
    .room-device-row:last-child { border-bottom:none; }
    .room-device-name { flex:1; font-size:11px; min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
    .room-device-empty { font-size:11px; color:var(--t3); padding:6px 0; }
    .dev-style-dot { width:5px; height:5px; border-radius:50%; background:var(--accent); flex-shrink:0; }
    .dev-style-panel { background:var(--s2); border:1px solid var(--border); border-radius:8px; padding:10px 12px; margin:2px 0 6px 18px; display:flex; flex-direction:column; gap:8px; }
    .block-toggles { display:flex; flex-wrap:wrap; gap:5px; }
    .block-tog { display:flex; align-items:center; gap:3px; font-size:10px; color:var(--t3); cursor:pointer; padding:2px 7px; border-radius:4px; border:1px solid var(--border); background:var(--s3); user-select:none; transition:color .12s,border-color .12s; }
    .block-tog.on { color:var(--text); border-color:var(--border2); }
    .tile-icon-row { display:flex; align-items:center; gap:6px; }
    .tile-icon-pickers { display:flex; align-items:center; gap:4px; flex:1; }
    .tile-icon-state-lbl { font-size:9px; font-weight:600; color:var(--t3); letter-spacing:.04em; text-transform:uppercase; flex-shrink:0; }
    .ent-anim-header { display:grid; grid-template-columns:1fr 1fr 1fr 0.8fr; gap:4px; padding:0 2px 2px; }
    .ent-anim-hcol { font-size:9px; font-weight:600; color:var(--t3); letter-spacing:.04em; text-transform:uppercase; }
    .ent-anim-hcol.name { /* first col */ }
    .ent-anim-row { display:grid; grid-template-columns:1fr 1fr 1fr 0.8fr; gap:4px; align-items:center; }
    .ent-anim-name { font-size:10px; color:var(--text); font-weight:500; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
    .anim-select { width:100%; font-size:10px; padding:3px 5px; border-radius:5px; border:1px solid var(--border); background:var(--s3); color:var(--text); cursor:pointer; outline:none; transition:border-color .12s; }
    .anim-select:focus { border-color:var(--acc,#f4601e); }
    .icon-picker-wrap { position:relative; display:inline-block; flex:1; }
    .icon-picker-wrap summary { list-style:none; }
    .icon-picker-wrap summary::-webkit-details-marker { display:none; }
    .icon-picker-btn { cursor:pointer; display:flex; align-items:center; gap:5px; padding:4px 8px; border-radius:6px; background:var(--s3,#1e1e1e); border:1px solid var(--border,#333); color:var(--text); min-height:26px; }
    .icon-picker-btn:hover { border-color:var(--acc,#f4601e); }
    .icon-picker-grid { position:absolute; z-index:20; top:calc(100% + 4px); left:0; display:grid; grid-template-columns:repeat(6,1fr); gap:3px; padding:8px; background:var(--s2,#1a1a1a); border:1px solid var(--border2,#444); border-radius:8px; width:240px; max-height:280px; overflow-y:auto; box-shadow:0 4px 20px rgba(0,0,0,0.5); }
    .icon-picker-grid.flip { left:auto; right:0; }
    .icon-cell { display:flex; flex-direction:column; align-items:center; gap:2px; padding:5px 3px; border:1px solid transparent; border-radius:5px; background:none; cursor:pointer; color:var(--acc,#f4601e); transition:background .1s,border-color .1s; }
    .icon-cell:hover { background:rgba(255,255,255,0.07); border-color:rgba(244,96,30,0.4); }
    .icon-cell.selected { background:rgba(244,96,30,0.18); border-color:var(--acc,#f4601e); }
    .icon-cell-label { font-size:0.58rem; color:var(--t3); max-width:34px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; text-align:center; }
    .icon-cell-none { font-size:1rem; color:var(--t3); }
    .icon-preview { width:20px; height:20px; display:block; }
    .icon-picker-btn.compact { padding:3px 5px; min-height:22px; justify-content:center; width:100%; }
    .icon-preview-sm { width:16px; height:16px; display:block; }
    .ent-icon-bulb.off .bulb-body,.ent-icon-bulb2.off .bulb-body { fill:none; stroke:currentColor; stroke-width:1.2; opacity:0.6; }
    .ent-icon-bulb.off .bulb-base1,.ent-icon-bulb.off .bulb-base2,
    .ent-icon-bulb2.off .bulb-base1,.ent-icon-bulb2.off .bulb-base2 { opacity:0.3; }
    .ent-icon-bulb2.off .bulb-filament { display:none; }
    .ent-icon-bulb3.off .bulb-chip { fill:none; stroke:currentColor; stroke-width:1; opacity:0.5; }
    .room-style-panel { margin:8px 0 12px; border:1px solid var(--border); border-radius:8px; overflow:hidden; }
    .style-panel-hdr { display:flex; align-items:center; justify-content:space-between; padding:8px 12px; background:var(--s2); font-size:12px; font-weight:600; }
    .clear-btn { font-size:10px; background:none; border:1px solid rgba(239,68,68,0.4); border-radius:4px; color:#ef4444; padding:3px 8px; cursor:pointer; }
    .style-tabs { display:flex; gap:4px; padding:6px 10px; background:var(--bg); border-bottom:1px solid var(--border); }
    .stab { flex:1; padding:5px 4px; border-radius:5px; font-size:10px; font-weight:600; text-align:center; cursor:pointer; border:1px solid var(--border); background:var(--s2); color:var(--t2); transition:all .12s; }
    .stab.on { background:var(--accentbg); border-color:var(--accentbdr); color:var(--accent); }
    .style-body { padding:10px 12px; }


    /* ── Step buttons ── */
    .step-row { display:flex; align-items:center; gap:6px; }
    .step-btn { width:28px; height:28px; border:1px solid var(--border2); border-radius:5px; background:var(--s2); color:var(--t2); font-size:16px; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all .12s; line-height:1; }
    .step-btn:hover { background:var(--s3); border-color:var(--accent); color:var(--text); }
    .step-val { font-family:monospace; font-size:13px; color:var(--text); min-width:28px; text-align:center; font-weight:500; }

    /* ── Drag list ── */
    .drag-list { display:flex; flex-direction:column; gap:4px; }
    .drag-item { display:flex; align-items:center; gap:10px; padding:9px 12px; background:var(--s2); border:1px solid var(--border); border-radius:8px; cursor:grab; transition:background .12s,border-color .12s; user-select:none; }
    .drag-item:hover { background:var(--s3); border-color:var(--border2); }
    .drag-item.drag-over { border-color:var(--accent); background:var(--accentbg); }
    .drag-item.hidden-item .drag-label { color:var(--t3); text-decoration:line-through; }
    .drag-handle { color:var(--t3); display:flex; flex-direction:column; gap:2px; cursor:grab; }
    .drag-handle span { display:block; width:14px; height:1.5px; background:currentColor; border-radius:1px; }
    .drag-label { font-size:12px; font-weight:500; color:var(--text); }
    .drag-sub { font-size:10px; color:var(--t3); }
    .drag-eye { background:none; border:none; color:var(--t3); cursor:pointer; font-size:13px; padding:2px 4px; border-radius:3px; transition:color .12s; }
    .drag-eye:hover { color:var(--text); }
    .tag-new { font-size:9px; font-weight:700; letter-spacing:0.06em; padding:2px 6px; border-radius:3px; text-transform:uppercase; background:var(--accentbg); color:var(--accent); border:1px solid var(--accentbdr); }

    /* ── Tile mini preview ── */
    .tile-preview { background:#141418; border:1px solid var(--border); border-radius:12px; padding:12px; margin-bottom:12px; position:relative; overflow:hidden; }
    .tile-preview::before { content:''; position:absolute; top:0; left:0; right:0; height:1.5px; background:linear-gradient(90deg,var(--accent),transparent); }
    .tile-preview-hdr { display:flex; align-items:center; justify-content:space-between; margin-bottom:8px; }
    .tp-dot { width:7px; height:7px; border-radius:50%; background:#4ade80; }
    .tp-tog { font-size:9px; font-weight:700; padding:3px 9px; border-radius:12px; background:var(--accent); color:white; letter-spacing:0.08em; }
    .tp-chips { display:flex; flex-wrap:wrap; gap:4px; margin-bottom:8px; }
    .tp-chip { font-size:9px; padding:2px 7px; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.08); border-radius:4px; color:var(--t2); }
    .tp-graph { height:30px; background:rgba(255,255,255,0.03); border-radius:4px; overflow:hidden; }
    .tp-bot { display:flex; align-items:center; justify-content:space-between; margin-top:7px; }
    .tp-power { font-size:13px; font-weight:700; color:var(--accent); }
    .tp-badge { font-size:8px; font-weight:700; padding:1px 5px; border-radius:3px; letter-spacing:0.04em; }


    /* ── Graph preview ── */
    .graph-preview { height:56px; background:var(--s2); border:1px solid var(--border); border-radius:8px; overflow:hidden; margin-bottom:10px; }

    /* ── Button preview ── */
    .btn-preview { display:flex; gap:8px; align-items:center; padding:10px; background:var(--s2); border:1px solid var(--border); border-radius:8px; margin-bottom:10px; }
    .preview-btn { font-size:11px; font-weight:700; letter-spacing:0.08em; padding:4px 12px; border-radius:20px; cursor:default; }
    .preview-btn.on { background:var(--accent); color:white; border:none; }
    .preview-btn.off { background:var(--s3); color:var(--t2); border:1px solid var(--border2); }

    /* ── Sensor grid ── */
    .sensors-hdr { display:flex; align-items:center; justify-content:space-between; margin-bottom:10px; }
    .sensors-hdr-lbl { font-size:11px; color:var(--t2); }
    .sensors-all-btn { background:rgba(244,96,30,0.12); color:#f4601e; border:1px solid rgba(244,96,30,0.3); border-radius:6px; padding:3px 10px; font-size:11px; cursor:pointer; }
    .sensors-all-btn:hover { background:rgba(244,96,30,0.22); }
    .sensor-graph-btn { margin-left:auto; flex-shrink:0; background:transparent; border:1px solid rgba(255,255,255,0.12); border-radius:6px; color:var(--t2); font-size:13px; padding:1px 6px; cursor:pointer; line-height:1.4; transition:all .12s; }
    .sensor-graph-btn.on { background:rgba(74,158,255,0.18); border-color:#4a9eff; color:#4a9eff; }
    .sensor-graph-btn:hover { border-color:rgba(255,255,255,0.3); color:var(--text); }
    .sensor-grid { display:grid; grid-template-columns:1fr 1fr; gap:5px; }
    .sensor-item { display:flex; align-items:center; gap:8px; padding:8px 10px; background:var(--s2); border:1px solid var(--border); border-radius:8px; cursor:pointer; transition:all .12s; user-select:none; }
    .sensor-item:hover { border-color:var(--border2); background:var(--s3); }
    .sensor-item.active { border-color:var(--accentbdr); background:var(--accentbg); }
    .sensor-dot { width:8px; height:8px; border-radius:50%; flex-shrink:0; transition:background .2s; }
    .sensor-item-body { display:flex; flex-direction:column; gap:1px; flex:1; min-width:0; }
    .sensor-unit { font-size:9px; color:var(--t3); letter-spacing:0.03em; }
    .sensor-name { font-size:11px; color:var(--t2); }
    .sensor-item.active .sensor-name { color:var(--text); }

    /* ── YAML ── */
    .yaml-out { font-family:monospace; font-size:11px; line-height:1.7; color:var(--t2); background:var(--s2); border:1px solid var(--border); border-radius:8px; padding:12px 14px; overflow-x:auto; white-space:pre; }
    .yaml-out::-webkit-scrollbar { height:4px; }
    .yaml-out::-webkit-scrollbar-thumb { background:var(--s3); border-radius:2px; }
    .btn-copy { font-size:11px; padding:4px 10px; border-radius:20px; border:1px solid var(--border2); background:transparent; color:var(--t2); cursor:pointer; transition:all .15s; }
    .btn-copy:hover { background:var(--s3); color:var(--text); }
    .style-toolbar { display:flex; align-items:center; gap:8px; margin-bottom:8px; }
    .btn-copy.active { background:var(--s3); color:var(--text); }
    .clip-feedback { font-size:11px; color:var(--t2); animation:fadeout 1.5s forwards; }
    @keyframes fadeout { 0%{opacity:1} 70%{opacity:1} 100%{opacity:0} }
    .paste-area { display:flex; flex-direction:column; gap:6px; margin-bottom:12px; }
    .paste-ta { font-size:11px; font-family:monospace; background:var(--s2); border:1px solid var(--border); border-radius:6px; color:var(--text); padding:8px; resize:vertical; width:100%; box-sizing:border-box; }
  `],e([ge({attribute:!1})],it.prototype,"hass",void 0),e([fe()],it.prototype,"_config",void 0),e([fe()],it.prototype,"_tab",void 0),e([fe()],it.prototype,"_openSections",void 0),e([fe()],it.prototype,"_expandedRooms",void 0),e([fe()],it.prototype,"_expandedDevices",void 0),e([fe()],it.prototype,"_deviceSearch",void 0),e([fe()],it.prototype,"_bgEditArea",void 0),e([fe()],it.prototype,"_styleTab",void 0),e([fe()],it.prototype,"_hiddenBlocks",void 0),e([fe()],it.prototype,"_dragOrder",void 0),e([fe()],it.prototype,"_dragOver",void 0),e([fe()],it.prototype,"_styleClipFeedback",void 0),e([fe()],it.prototype,"_copyAreaOpen",void 0),e([fe()],it.prototype,"_copyJson",void 0),e([fe()],it.prototype,"_pasteOpen",void 0),e([fe()],it.prototype,"_pasteText",void 0),it=e([pe("ha-device-dashboard-editor")],it),window.customCards=window.customCards||[],window.customCards.push({type:"ha-device-dashboard",name:"HA Device Dashboard",description:"Universal device fleet overview — Shelly, ZHA, Hue, ESPHome, Matter and more.",preview:!0,documentationURL:"https://github.com/TheIcelandicguy/ha-device-dashboard"});
