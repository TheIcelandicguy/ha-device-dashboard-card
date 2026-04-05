function e(e,t,s,i){var a,r=arguments.length,o=r<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,s):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)o=Reflect.decorate(e,t,s,i);else for(var n=e.length-1;n>=0;n--)(a=e[n])&&(o=(r<3?a(o):r>3?a(t,s,o):a(t,s))||o);return r>3&&o&&Object.defineProperty(t,s,o),o}"function"==typeof SuppressedError&&SuppressedError;const t=globalThis,s=t.ShadowRoot&&(void 0===t.ShadyCSS||t.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,i=Symbol(),a=new WeakMap;let r=class{constructor(e,t,s){if(this._$cssResult$=!0,s!==i)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o;const t=this.t;if(s&&void 0===e){const s=void 0!==t&&1===t.length;s&&(e=a.get(t)),void 0===e&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),s&&a.set(t,e))}return e}toString(){return this.cssText}};const o=(e,...t)=>{const s=1===e.length?e[0]:t.reduce((t,s,i)=>t+(e=>{if(!0===e._$cssResult$)return e.cssText;if("number"==typeof e)return e;throw Error("Value passed to 'css' function must be a 'css' function result: "+e+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(s)+e[i+1],e[0]);return new r(s,e,i)},n=s?e=>e:e=>e instanceof CSSStyleSheet?(e=>{let t="";for(const s of e.cssRules)t+=s.cssText;return(e=>new r("string"==typeof e?e:e+"",void 0,i))(t)})(e):e,{is:l,defineProperty:c,getOwnPropertyDescriptor:d,getOwnPropertyNames:p,getOwnPropertySymbols:h,getPrototypeOf:g}=Object,u=globalThis,v=u.trustedTypes,b=v?v.emptyScript:"",f=u.reactiveElementPolyfillSupport,m=(e,t)=>e,_={toAttribute(e,t){switch(t){case Boolean:e=e?b:null;break;case Object:case Array:e=null==e?e:JSON.stringify(e)}return e},fromAttribute(e,t){let s=e;switch(t){case Boolean:s=null!==e;break;case Number:s=null===e?null:Number(e);break;case Object:case Array:try{s=JSON.parse(e)}catch(e){s=null}}return s}},x=(e,t)=>!l(e,t),y={attribute:!0,type:String,converter:_,reflect:!1,useDefault:!1,hasChanged:x};Symbol.metadata??=Symbol("metadata"),u.litPropertyMetadata??=new WeakMap;let $=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=y){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){const s=Symbol(),i=this.getPropertyDescriptor(e,s,t);void 0!==i&&c(this.prototype,e,i)}}static getPropertyDescriptor(e,t,s){const{get:i,set:a}=d(this.prototype,e)??{get(){return this[t]},set(e){this[t]=e}};return{get:i,set(t){const r=i?.call(this);a?.call(this,t),this.requestUpdate(e,r,s)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??y}static _$Ei(){if(this.hasOwnProperty(m("elementProperties")))return;const e=g(this);e.finalize(),void 0!==e.l&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(m("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(m("properties"))){const e=this.properties,t=[...p(e),...h(e)];for(const s of t)this.createProperty(s,e[s])}const e=this[Symbol.metadata];if(null!==e){const t=litPropertyMetadata.get(e);if(void 0!==t)for(const[e,s]of t)this.elementProperties.set(e,s)}this._$Eh=new Map;for(const[e,t]of this.elementProperties){const s=this._$Eu(e,t);void 0!==s&&this._$Eh.set(s,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){const t=[];if(Array.isArray(e)){const s=new Set(e.flat(1/0).reverse());for(const e of s)t.unshift(n(e))}else void 0!==e&&t.push(n(e));return t}static _$Eu(e,t){const s=t.attribute;return!1===s?void 0:"string"==typeof s?s:"string"==typeof e?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??=new Set).add(e),void 0!==this.renderRoot&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){const e=new Map,t=this.constructor.elementProperties;for(const s of t.keys())this.hasOwnProperty(s)&&(e.set(s,this[s]),delete this[s]);e.size>0&&(this._$Ep=e)}createRenderRoot(){const e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return((e,i)=>{if(s)e.adoptedStyleSheets=i.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet);else for(const s of i){const i=document.createElement("style"),a=t.litNonce;void 0!==a&&i.setAttribute("nonce",a),i.textContent=s.cssText,e.appendChild(i)}})(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,t,s){this._$AK(e,s)}_$ET(e,t){const s=this.constructor.elementProperties.get(e),i=this.constructor._$Eu(e,s);if(void 0!==i&&!0===s.reflect){const a=(void 0!==s.converter?.toAttribute?s.converter:_).toAttribute(t,s.type);this._$Em=e,null==a?this.removeAttribute(i):this.setAttribute(i,a),this._$Em=null}}_$AK(e,t){const s=this.constructor,i=s._$Eh.get(e);if(void 0!==i&&this._$Em!==i){const e=s.getPropertyOptions(i),a="function"==typeof e.converter?{fromAttribute:e.converter}:void 0!==e.converter?.fromAttribute?e.converter:_;this._$Em=i;const r=a.fromAttribute(t,e.type);this[i]=r??this._$Ej?.get(i)??r,this._$Em=null}}requestUpdate(e,t,s,i=!1,a){if(void 0!==e){const r=this.constructor;if(!1===i&&(a=this[e]),s??=r.getPropertyOptions(e),!((s.hasChanged??x)(a,t)||s.useDefault&&s.reflect&&a===this._$Ej?.get(e)&&!this.hasAttribute(r._$Eu(e,s))))return;this.C(e,t,s)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(e,t,{useDefault:s,reflect:i,wrapped:a},r){s&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,r??t??this[e]),!0!==a||void 0!==r)||(this._$AL.has(e)||(this.hasUpdated||s||(t=void 0),this._$AL.set(e,t)),!0===i&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}const e=this.scheduleUpdate();return null!=e&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[e,t]of this._$Ep)this[e]=t;this._$Ep=void 0}const e=this.constructor.elementProperties;if(e.size>0)for(const[t,s]of e){const{wrapped:e}=s,i=this[t];!0!==e||this._$AL.has(t)||void 0===i||this.C(t,void 0,s,i)}}let e=!1;const t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach(e=>e.hostUpdate?.()),this.update(t)):this._$EM()}catch(t){throw e=!1,this._$EM(),t}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach(e=>e.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach(e=>this._$ET(e,this[e])),this._$EM()}updated(e){}firstUpdated(e){}};$.elementStyles=[],$.shadowRootOptions={mode:"open"},$[m("elementProperties")]=new Map,$[m("finalized")]=new Map,f?.({ReactiveElement:$}),(u.reactiveElementVersions??=[]).push("2.1.2");const w=globalThis,k=e=>e,S=w.trustedTypes,A=S?S.createPolicy("lit-html",{createHTML:e=>e}):void 0,C="$lit$",z=`lit$${Math.random().toFixed(9).slice(2)}$`,T="?"+z,P=`<${T}>`,M=document,O=()=>M.createComment(""),E=e=>null===e||"object"!=typeof e&&"function"!=typeof e,I=Array.isArray,D="[ \t\n\f\r]",F=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,R=/-->/g,B=/>/g,N=RegExp(`>|${D}(?:([^\\s"'>=/]+)(${D}*=${D}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),H=/'/g,U=/"/g,j=/^(?:script|style|textarea|title)$/i,L=e=>(t,...s)=>({_$litType$:e,strings:t,values:s}),V=L(1),q=L(2),G=Symbol.for("lit-noChange"),W=Symbol.for("lit-nothing"),Q=new WeakMap,J=M.createTreeWalker(M,129);function Z(e,t){if(!I(e)||!e.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==A?A.createHTML(t):t}const Y=(e,t)=>{const s=e.length-1,i=[];let a,r=2===t?"<svg>":3===t?"<math>":"",o=F;for(let t=0;t<s;t++){const s=e[t];let n,l,c=-1,d=0;for(;d<s.length&&(o.lastIndex=d,l=o.exec(s),null!==l);)d=o.lastIndex,o===F?"!--"===l[1]?o=R:void 0!==l[1]?o=B:void 0!==l[2]?(j.test(l[2])&&(a=RegExp("</"+l[2],"g")),o=N):void 0!==l[3]&&(o=N):o===N?">"===l[0]?(o=a??F,c=-1):void 0===l[1]?c=-2:(c=o.lastIndex-l[2].length,n=l[1],o=void 0===l[3]?N:'"'===l[3]?U:H):o===U||o===H?o=N:o===R||o===B?o=F:(o=N,a=void 0);const p=o===N&&e[t+1].startsWith("/>")?" ":"";r+=o===F?s+P:c>=0?(i.push(n),s.slice(0,c)+C+s.slice(c)+z+p):s+z+(-2===c?t:p)}return[Z(e,r+(e[s]||"<?>")+(2===t?"</svg>":3===t?"</math>":"")),i]};class K{constructor({strings:e,_$litType$:t},s){let i;this.parts=[];let a=0,r=0;const o=e.length-1,n=this.parts,[l,c]=Y(e,t);if(this.el=K.createElement(l,s),J.currentNode=this.el.content,2===t||3===t){const e=this.el.content.firstChild;e.replaceWith(...e.childNodes)}for(;null!==(i=J.nextNode())&&n.length<o;){if(1===i.nodeType){if(i.hasAttributes())for(const e of i.getAttributeNames())if(e.endsWith(C)){const t=c[r++],s=i.getAttribute(e).split(z),o=/([.?@])?(.*)/.exec(t);n.push({type:1,index:a,name:o[2],strings:s,ctor:"."===o[1]?ie:"?"===o[1]?ae:"@"===o[1]?re:se}),i.removeAttribute(e)}else e.startsWith(z)&&(n.push({type:6,index:a}),i.removeAttribute(e));if(j.test(i.tagName)){const e=i.textContent.split(z),t=e.length-1;if(t>0){i.textContent=S?S.emptyScript:"";for(let s=0;s<t;s++)i.append(e[s],O()),J.nextNode(),n.push({type:2,index:++a});i.append(e[t],O())}}}else if(8===i.nodeType)if(i.data===T)n.push({type:2,index:a});else{let e=-1;for(;-1!==(e=i.data.indexOf(z,e+1));)n.push({type:7,index:a}),e+=z.length-1}a++}}static createElement(e,t){const s=M.createElement("template");return s.innerHTML=e,s}}function X(e,t,s=e,i){if(t===G)return t;let a=void 0!==i?s._$Co?.[i]:s._$Cl;const r=E(t)?void 0:t._$litDirective$;return a?.constructor!==r&&(a?._$AO?.(!1),void 0===r?a=void 0:(a=new r(e),a._$AT(e,s,i)),void 0!==i?(s._$Co??=[])[i]=a:s._$Cl=a),void 0!==a&&(t=X(e,a._$AS(e,t.values),a,i)),t}class ee{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){const{el:{content:t},parts:s}=this._$AD,i=(e?.creationScope??M).importNode(t,!0);J.currentNode=i;let a=J.nextNode(),r=0,o=0,n=s[0];for(;void 0!==n;){if(r===n.index){let t;2===n.type?t=new te(a,a.nextSibling,this,e):1===n.type?t=new n.ctor(a,n.name,n.strings,this,e):6===n.type&&(t=new oe(a,this,e)),this._$AV.push(t),n=s[++o]}r!==n?.index&&(a=J.nextNode(),r++)}return J.currentNode=M,i}p(e){let t=0;for(const s of this._$AV)void 0!==s&&(void 0!==s.strings?(s._$AI(e,s,t),t+=s.strings.length-2):s._$AI(e[t])),t++}}class te{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,s,i){this.type=2,this._$AH=W,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=s,this.options=i,this._$Cv=i?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode;const t=this._$AM;return void 0!==t&&11===e?.nodeType&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=X(this,e,t),E(e)?e===W||null==e||""===e?(this._$AH!==W&&this._$AR(),this._$AH=W):e!==this._$AH&&e!==G&&this._(e):void 0!==e._$litType$?this.$(e):void 0!==e.nodeType?this.T(e):(e=>I(e)||"function"==typeof e?.[Symbol.iterator])(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==W&&E(this._$AH)?this._$AA.nextSibling.data=e:this.T(M.createTextNode(e)),this._$AH=e}$(e){const{values:t,_$litType$:s}=e,i="number"==typeof s?this._$AC(e):(void 0===s.el&&(s.el=K.createElement(Z(s.h,s.h[0]),this.options)),s);if(this._$AH?._$AD===i)this._$AH.p(t);else{const e=new ee(i,this),s=e.u(this.options);e.p(t),this.T(s),this._$AH=e}}_$AC(e){let t=Q.get(e.strings);return void 0===t&&Q.set(e.strings,t=new K(e)),t}k(e){I(this._$AH)||(this._$AH=[],this._$AR());const t=this._$AH;let s,i=0;for(const a of e)i===t.length?t.push(s=new te(this.O(O()),this.O(O()),this,this.options)):s=t[i],s._$AI(a),i++;i<t.length&&(this._$AR(s&&s._$AB.nextSibling,i),t.length=i)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e!==this._$AB;){const t=k(e).nextSibling;k(e).remove(),e=t}}setConnected(e){void 0===this._$AM&&(this._$Cv=e,this._$AP?.(e))}}class se{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,s,i,a){this.type=1,this._$AH=W,this._$AN=void 0,this.element=e,this.name=t,this._$AM=i,this.options=a,s.length>2||""!==s[0]||""!==s[1]?(this._$AH=Array(s.length-1).fill(new String),this.strings=s):this._$AH=W}_$AI(e,t=this,s,i){const a=this.strings;let r=!1;if(void 0===a)e=X(this,e,t,0),r=!E(e)||e!==this._$AH&&e!==G,r&&(this._$AH=e);else{const i=e;let o,n;for(e=a[0],o=0;o<a.length-1;o++)n=X(this,i[s+o],t,o),n===G&&(n=this._$AH[o]),r||=!E(n)||n!==this._$AH[o],n===W?e=W:e!==W&&(e+=(n??"")+a[o+1]),this._$AH[o]=n}r&&!i&&this.j(e)}j(e){e===W?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}}class ie extends se{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===W?void 0:e}}class ae extends se{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==W)}}class re extends se{constructor(e,t,s,i,a){super(e,t,s,i,a),this.type=5}_$AI(e,t=this){if((e=X(this,e,t,0)??W)===G)return;const s=this._$AH,i=e===W&&s!==W||e.capture!==s.capture||e.once!==s.once||e.passive!==s.passive,a=e!==W&&(s===W||i);i&&this.element.removeEventListener(this.name,this,s),a&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}}class oe{constructor(e,t,s){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=s}get _$AU(){return this._$AM._$AU}_$AI(e){X(this,e)}}const ne=w.litHtmlPolyfillSupport;ne?.(K,te),(w.litHtmlVersions??=[]).push("3.3.2");const le=globalThis;let ce=class extends ${constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){const t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=((e,t,s)=>{const i=s?.renderBefore??t;let a=i._$litPart$;if(void 0===a){const e=s?.renderBefore??null;i._$litPart$=a=new te(t.insertBefore(O(),e),e,void 0,s??{})}return a._$AI(e),a})(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return G}};ce._$litElement$=!0,ce.finalized=!0,le.litElementHydrateSupport?.({LitElement:ce});const de=le.litElementPolyfillSupport;de?.({LitElement:ce}),(le.litElementVersions??=[]).push("4.2.2");const pe=e=>(t,s)=>{void 0!==s?s.addInitializer(()=>{customElements.define(e,t)}):customElements.define(e,t)},he={attribute:!0,type:String,converter:_,reflect:!1,hasChanged:x},ge=(e=he,t,s)=>{const{kind:i,metadata:a}=s;let r=globalThis.litPropertyMetadata.get(a);if(void 0===r&&globalThis.litPropertyMetadata.set(a,r=new Map),"setter"===i&&((e=Object.create(e)).wrapped=!0),r.set(s.name,e),"accessor"===i){const{name:i}=s;return{set(s){const a=t.get.call(this);t.set.call(this,s),this.requestUpdate(i,a,e,!0,s)},init(t){return void 0!==t&&this.C(i,void 0,e,t),t}}}if("setter"===i){const{name:i}=s;return function(s){const a=this[i];t.call(this,s),this.requestUpdate(i,a,e,!0,s)}}throw Error("Unsupported decorator location: "+i)};function ue(e){return(t,s)=>"object"==typeof s?ge(e,t,s):((e,t,s)=>{const i=t.hasOwnProperty(s);return t.constructor.createProperty(s,e),i?Object.getOwnPropertyDescriptor(t,s):void 0})(e,t,s)}function ve(e){return ue({...e,state:!0,attribute:!1})}const be=1;let fe=class{constructor(e){}get _$AU(){return this._$AM._$AU}_$AT(e,t,s){this._$Ct=e,this._$AM=t,this._$Ci=s}_$AS(e,t){return this.update(e,t)}update(e,t){return this.render(...t)}};const me="important",_e=" !"+me,xe=(e=>(...t)=>({_$litDirective$:e,values:t}))(class extends fe{constructor(e){if(super(e),e.type!==be||"style"!==e.name||e.strings?.length>2)throw Error("The `styleMap` directive must be used in the `style` attribute and must be the only part in the attribute.")}render(e){return Object.keys(e).reduce((t,s)=>{const i=e[s];return null==i?t:t+`${s=s.includes("-")?s:s.replace(/(?:^(webkit|moz|ms|o)|)(?=[A-Z])/g,"-$&").toLowerCase()}:${i};`},"")}update(e,[t]){const{style:s}=e.element;if(void 0===this.ft)return this.ft=new Set(Object.keys(t)),this.render(t);for(const e of this.ft)null==t[e]&&(this.ft.delete(e),e.includes("-")?s.removeProperty(e):s[e]=null);for(const e in t){const i=t[e];if(null!=i){this.ft.add(e);const t="string"==typeof i&&i.endsWith(_e);e.includes("-")||t?s.setProperty(e,t?i.slice(0,-11):i,t?me:""):s[e]=i}}return G}}),ye=new Set(["switch","light","cover","valve","climate","sensor","binary_sensor","fan","lock","media_player","vacuum","alarm_control_panel","humidifier","water_heater","update","button","number","select","text","camera","event"]),$e=new Set(["script","scene","automation","input_boolean","input_number","input_text","input_select","input_datetime","input_button","timer","counter"]);function we(e,t){const s=e.entities??{},i=e.devices??{},a=e.areas??{},r=t&&t.length>0?new Set(t.map(e=>e.toLowerCase())):null,o=new Map;for(const[t,n]of Object.entries(s)){if(!n?.device_id)continue;if(n.hidden_by)continue;const s=t.split(".")[0];if(!ye.has(s))continue;const l=(n.platform??"").toLowerCase();if(r&&!r.has(l))continue;const c=n.device_id;if(!o.has(c)){const e=i[c];if(!e)continue;const t=(e.configuration_url??"").match(/https?:\/\/((?:\d{1,3}\.){3}\d{1,3})/),s=(e.manufacturer??"").toLowerCase().includes("shelly")||"shelly"===l,r=e.area_id??n.area_id,d=r?a[r]?.name:void 0;o.set(c,{device_id:c,name:e.name_by_user??e.name??c,area:d,model:e.model,sw_version:e.sw_version,ip:t?t[1]:void 0,isShelly:s,integration:l,entities:[]})}const d=o.get(c);d.isShelly||"shelly"!==l||(d.isShelly=!0,d.integration="shelly");const p=e.states[t];d.entities.push({entity_id:t,domain:s,state:p?.state??"unavailable",attributes:p?.attributes??{},device_id:c,area_id:n.area_id,platform:l})}const n=new Set;for(const[e,t]of o){if(n.has(e))continue;const s=i[e],a=s?.via_device_id;if(!a||!o.has(a)||n.has(a))continue;const r=i[a],l=s?.configuration_url??"",c=r?.configuration_url??"",d=e=>{const t=e.match(/https?:\/\/([^/]+)/);return t?t[1]:""},p=l&&c&&d(l)===d(c),h=!l&&c&&t.integration===o.get(a).integration;if(!p&&!h)continue;const g=o.get(a);g.entities.push(...t.entities),!g.ip&&t.ip&&(g.ip=t.ip),!g.model&&t.model&&(g.model=t.model),n.add(e)}for(const e of n)o.delete(e);return Array.from(o.values()).filter(e=>e.entities.length>0).sort((e,t)=>e.name.localeCompare(t.name))}function ke(e,t){const s=e.devices??{},i=e.entities??{},a=e.areas??{},r=s[t];if(!r)return null;const o=(r.configuration_url??"").match(/https?:\/\/((?:\d{1,3}\.){3}\d{1,3})/),n=(r.manufacturer??"").toLowerCase(),l=r.area_id,c=l?a[l]?.name:void 0,d={device_id:t,name:r.name_by_user??r.name??t,area:c,model:r.model,sw_version:r.sw_version,ip:o?o[1]:void 0,isShelly:n.includes("shelly"),integration:"",entities:[]};for(const s of Object.values(e.states)){const e=i[s.entity_id];if(e?.device_id!==t)continue;if(e?.hidden_by)continue;const a=s.entity_id.split(".")[0],r=(e.platform??"").toLowerCase();d.isShelly||"shelly"!==r||(d.isShelly=!0,d.integration="shelly"),d.entities.push({entity_id:s.entity_id,domain:a,state:s.state,attributes:s.attributes,device_id:t,platform:r})}return 0===d.entities.length?null:(!d.integration&&d.entities[0]&&(d.integration=d.entities[0].platform??""),d)}const Se={relay:"Relay",plug:"Plug",switch:"Switch",dimmer:"Dimmer",rgb:"RGB",light:"Light",climate:"TRV",cover:"Roller",fan:"Fan",lock:"Lock",vacuum:"Vacuum",media_player:"Media",alarm:"Alarm",humidifier:"Humid.",valve:"Valve",energy:"Energy",sensor:"Sensor",input:"Input",camera:"Camera",uni:"UNI",wall_display:"Display",script:"Script",scene:"Scene",automation:"Automation",helper:"Helper",weather:"Weather",person:"Person",generic:""},Ae={relay:["name_row","sensors","graph","power_bar","badges"],plug:["name_row","sensors","graph","power_bar","badges"],switch:["name_row","sensors","badges"],dimmer:["name_row","dimmer","sensors","graph","badges"],rgb:["name_row","dimmer","sensors","graph","badges"],light:["name_row","dimmer","sensors","badges"],climate:["name_row","sensors","trv_control","badges"],cover:["name_row","cover_controls","sensors","badges"],fan:["name_row","fan_controls","sensors","badges"],lock:["name_row","sensors","badges"],vacuum:["name_row","sensors","badges"],media_player:["name_row","media_controls","badges"],alarm:["name_row","sensors","badges"],humidifier:["name_row","sensors","badges"],valve:["name_row","sensors","valve_controls","badges"],energy:["name_row","sensors","graph","badges"],sensor:["name_row","sensors","graph","badges"],input:["name_row","input_channels","badges"],camera:["name_row","badges"],uni:["name_row","input_channels","sensors","badges"],wall_display:["name_row","sensors","trv_control","badges"],script:["name_row","sensors","badges"],scene:["name_row","badges"],automation:["name_row","sensors","badges"],helper:["name_row","sensors","badges"],weather:["name_row","sensors"],person:["name_row","sensors"],generic:["name_row","sensors","badges"]};const Ce={shelly:"Shelly",zha:"ZHA",mqtt:"MQTT",z2m:"Z2M",zigbee2mqtt:"Z2M",hue:"Hue",deconz:"deCONZ",matter:"Matter",homekit:"HomeKit",tuya:"Tuya",tplink:"Kasa",esphome:"ESPHome",wled:"WLED",tasmota:"Tasmota",konnected:"Konnected",nest:"Nest",ring:"Ring",lifx:"LIFX",nanoleaf:"Nanoleaf",sonos:"Sonos"};function ze(e){return e>=1e3?`${(e/1e3).toFixed(2)} kW`:`${e.toFixed(1)} W`}function Te(e){return`${e.toFixed(3)} kWh`}function Pe(e){return`${e.toFixed(1)} V`}function Me(e){return`${e.toFixed(3)} A`}function Oe(e){return`${e.toFixed(1)} °C`}function Ee(e){return e<60?`${e}s`:e<3600?`${Math.floor(e/60)}m`:e<86400?`${Math.floor(e/3600)}h ${Math.floor(e%3600/60)}m`:`${Math.floor(e/86400)}d ${Math.floor(e%86400/3600)}h`}function Ie(e){return e>=-50?"Excellent":e>=-60?"Good":e>=-70?"Fair":"Poor"}function De(e){return`${e.toFixed(1)} VA`}function Fe(e){return`${e.toFixed(1)} VAr`}function Re(e){return`${e.toFixed(2)} Hz`}function Be(e){return`${e.toFixed(1)} %`}function Ne(e){return e>=1e4?`${(e/1e3).toFixed(1)} klx`:`${Math.round(e)} lx`}function He(e){return`${Math.round(e)} ppm`}function Ue(e){return`${Math.round(e)} %`}const je=[{key:"power",label:"Power",unit:"W",group:"Electrical",defaultColor:"#f4601e"},{key:"voltage",label:"Voltage",unit:"V",group:"Electrical",defaultColor:"#a78bfa"},{key:"current",label:"Current",unit:"A",group:"Electrical",defaultColor:"#fbbf24"},{key:"energy",label:"Energy",unit:"kWh",group:"Electrical",defaultColor:"#4ade80"},{key:"apparent_power",label:"App. Power",unit:"VA",group:"Electrical",defaultColor:"#f472b6"},{key:"reactive_power",label:"React. Power",unit:"VAr",group:"Electrical",defaultColor:"#818cf8"},{key:"frequency",label:"Frequency",unit:"Hz",group:"Electrical",defaultColor:"#34d399"},{key:"power_factor",label:"Power Factor",unit:"%",group:"Electrical",defaultColor:"#fb923c"},{key:"temperature",label:"Temperature",unit:"°C",group:"Environmental",defaultColor:"#4fc3f7"},{key:"humidity",label:"Humidity",unit:"%",group:"Environmental",defaultColor:"#2dd4bf"},{key:"illuminance",label:"Illuminance",unit:"lx",group:"Environmental",defaultColor:"#fde047"},{key:"carbon_dioxide",label:"CO₂",unit:"ppm",group:"Environmental",defaultColor:"#a3e635"},{key:"gas",label:"Gas",unit:"%",group:"Environmental",defaultColor:"#fb923c"},{key:"battery",label:"Battery",unit:"%",group:"Device",defaultColor:"#86efac"},{key:"signal_strength",label:"RSSI",unit:"dBm",group:"Device",defaultColor:"#7dd3fc"}],Le=Object.fromEntries(je.map(e=>[e.key,e.label.split(" ")[0]]));var Ve;let qe=Ve=class extends ce{constructor(){super(...arguments),this.preview=!1,this._closedAreas=new Set,this._entityListOpen=new Set,this._graphData=new Map,this._graphFetching=new Set,this._graphFetchedAt=new Map,this._cachedDevices=null,this._cacheEntitiesRef=null,this._cacheDevicesRef=null,this._cacheConfigRef=null,this._fetchQueue=[],this._fetchQueueRunning=!1}static getConfigElement(){return document.createElement("ha-device-dashboard-editor")}static getStubConfig(){return{type:"custom:ha-device-dashboard"}}static getLayoutOptions(){return{grid_columns:10,grid_min_columns:4,grid_min_rows:3}}setConfig(e){this._config=e}getCardSize(){return 6}disconnectedCallback(){super.disconnectedCallback(),this._graphFetching.clear(),this._graphFetchedAt.clear(),this._graphData=new Map}_getDevices(){if(!this.hass)return[];const e=this.hass.entities,t=this.hass.devices;if(this._cachedDevices&&e===this._cacheEntitiesRef&&t===this._cacheDevicesRef&&this._config===this._cacheConfigRef)return this._cachedDevices;this._cacheEntitiesRef=e,this._cacheDevicesRef=t,this._cacheConfigRef=this._config;let s=we(this.hass,this._config.integrations);const i=this._config.areas;if(void 0!==i){const e=new Set(i.map(e=>e.toLowerCase()));s=s.filter(t=>e.has((t.area??"").toLowerCase()))}if(!1===this._config.show_offline&&(s=s.filter(e=>this._isOnline(e))),this._config.hide_shelly&&(s=s.filter(e=>!e.isShelly)),this._config.hidden_devices?.length){const e=new Set(this._config.hidden_devices);s=s.filter(t=>!e.has(t.device_id))}if(this._config.include_entities){const e=function(e,t){const s=e.entities??{},i=e.areas??{},a=t&&t.length>0?new Set(t.map(e=>e.replace(".*",""))):$e,r=[];for(const t of Object.values(e.states)){const e=t.entity_id.split(".")[0];if(!a.has(e))continue;const o=s[t.entity_id];if(o?.device_id)continue;if(o?.hidden_by)continue;const n=o?.area_id,l=n?i[n]?.name:void 0,c=t.attributes?.friendly_name??t.entity_id.split(".")[1].replace(/_/g," ");r.push({device_id:t.entity_id,name:c,area:l,isShelly:!1,integration:e,isVirtual:!0,entities:[{entity_id:t.entity_id,domain:e,state:t.state,attributes:t.attributes,platform:e}]})}return r.sort((e,t)=>e.name.localeCompare(t.name))}(this.hass,this._config.entity_domains);s=[...s,...e]}if(this._config.extra_devices?.length){const e=new Set(s.map(e=>e.device_id));for(const t of this._config.extra_devices){if(e.has(t))continue;const i=ke(this.hass,t);i&&s.push(i)}}return this._cachedDevices=s,s}_groupByArea(e){const t=new Map;for(const s of e){const e=s.area??"";t.has(e)||t.set(e,[]),t.get(e).push(s)}const s=this._config.sort_by??"name";return new Map([...t.entries()].sort(([e],[t])=>e?t?e.localeCompare(t):-1:1).map(([e,t])=>[e,t.sort("power"===s?(e,t)=>(this._getPower(t)??-1)-(this._getPower(e)??-1):"online"===s?(e,t)=>Number(this._isOnline(t))-Number(this._isOnline(e))||e.name.localeCompare(t.name):(e,t)=>e.name.localeCompare(t.name))]))}_isOnline(e){return e.entities.some(e=>{const t=this.hass.states[e.entity_id];return t&&"unavailable"!==t.state&&"unknown"!==t.state})}_getPower(e){let t=0,s=!1;for(const i of e.entities){const e=this.hass.states[i.entity_id];if(!e)continue;const a=e.attributes;if(null!=a.current_power_w){const e=Number(a.current_power_w);isNaN(e)||(t+=e,s=!0);continue}if("sensor"===i.domain&&"power"===a.device_class){const i=parseFloat(e.state);isNaN(i)||(t+=i,s=!0)}}return s?t:null}_getPrimarySwitch(e){for(const t of e.entities){if("switch"!==t.domain&&"light"!==t.domain)continue;const e=this.hass.states[t.entity_id];if(!e)continue;const s=e.attributes;let i,a,r,o;if("light"===t.domain){i="on"===e.state&&null!=s.brightness?Math.round(s.brightness/Ve.BRIGHTNESS_MAX*100):0;const t=s.supported_color_modes??[];if(t.some(e=>["rgb","rgbw","rgbww","hs","xy"].includes(e))&&(a=t),s.rgbw_color){const[e,t,i,a]=s.rgbw_color;r=[e,t,i],o=a}else s.rgb_color&&(r=s.rgb_color)}return{entityId:t.entity_id,isOn:"on"===e.state,brightness:i,colorModes:a,rgbColor:r,whiteValue:o}}return null}_getTrv(e){const t=e.entities.find(e=>"climate"===e.domain);if(!t)return null;const s=this.hass.states[t.entity_id];if(!s)return null;const i=s.attributes;let a=i.current_valve_position??i.valve_position;if(null==a){const t=e.entities.find(e=>"sensor"===e.domain&&e.entity_id.includes("valve"));if(t){const e=parseFloat(this.hass.states[t.entity_id]?.state??"");isNaN(e)||(a=e)}}return{entityId:t.entity_id,currentTemp:i.current_temperature,targetTemp:i.temperature,minTemp:i.min_temp??4,maxTemp:i.max_temp??30,step:i.target_temp_step??.5,hvacMode:s.state,hvacAction:i.hvac_action??s.state,presetMode:i.preset_mode,presetModes:(i.preset_modes??[]).filter(e=>"none"!==e),valvePosition:a}}_getCover(e){const t=e.entities.find(e=>"cover"===e.domain);if(!t)return null;const s=this.hass.states[t.entity_id];return s?{entityId:t.entity_id,state:s.state,position:s.attributes?.current_position}:null}_getValve(e){const t=e.entities.find(e=>"valve"===e.domain);if(!t)return null;const s=this.hass.states[t.entity_id];if(!s)return null;let i,a=s.attributes?.current_position;if(null==a){const t=e.entities.find(e=>"sensor"===e.domain&&e.entity_id.includes("position"));if(t){const e=parseFloat(this.hass.states[t.entity_id]?.state??"");isNaN(e)||(a=e)}}const r=e.entities.find(e=>"sensor"===e.domain&&"temperature"===this.hass.states[e.entity_id]?.attributes?.device_class);if(r){const e=parseFloat(this.hass.states[r.entity_id]?.state??"");isNaN(e)||(i=e)}return{entityId:t.entity_id,state:s.state,position:a,temperature:i}}_getFan(e){const t=e.entities.find(e=>"fan"===e.domain);if(!t)return null;const s=this.hass.states[t.entity_id];if(!s)return null;const i=s.attributes;return{entityId:t.entity_id,isOn:"on"===s.state,percentage:i.percentage,percentageStep:i.percentage_step??10,oscillating:i.oscillating,presetMode:i.preset_mode,presetModes:i.preset_modes??[]}}_getMedia(e){const t=e.entities.find(e=>"media_player"===e.domain);if(!t)return null;const s=this.hass.states[t.entity_id];if(!s)return null;const i=s.attributes;return{entityId:t.entity_id,state:s.state,isPlaying:"playing"===s.state,volume:i.volume_level,isMuted:i.is_volume_muted,title:i.media_title,artist:i.media_artist}}async _setValvePosition(e,t){await this.hass.callService("valve","set_valve_position",{entity_id:e,position:Math.round(Math.max(0,Math.min(100,t)))})}_getAlerts(e){const t=[];for(const s of e.entities){if("binary_sensor"!==s.domain)continue;const e=this.hass.states[s.entity_id];if(!e||"on"!==e.state)continue;const i=e.attributes.device_class??"";"heat"===i||s.entity_id.includes("overtemp")?t.push("overtemp"):("safety"===i||s.entity_id.includes("overpower"))&&t.push("overpower")}return t}_getFirmware(e){for(const t of e.entities){if("update"!==t.domain)continue;const e=this.hass.states[t.entity_id];if(!e||"on"!==e.state)continue;const s=e.attributes;return{entityId:t.entity_id,current:s.installed_version??"",newVersion:s.latest_version}}return null}_chLabel(e){const t=e.match(/[_-](?:switch|channel|ch|output)_?(\d+)[_-]/i)??e.match(/[_-](\d+)[_-](?:power|energy|voltage|current|apparent|reactive|factor|freq)/i)??e.match(/(?:power|energy|voltage|current|freq|apparent|reactive)[_-](\d+)$/i);return t?"Ch "+(+t[1]+1):""}_timeAgo(e){if(!e)return"Never";const t=Date.now()-new Date(e).getTime();return isNaN(t)||t<0?"Never":t<6e4?"Just now":t<36e5?`${Math.floor(t/6e4)}m ago`:t<864e5?`${Math.floor(t/36e5)}h ago`:`${Math.floor(t/864e5)}d ago`}_getSensors(e){const t=this._config.sensors?.length?new Set(this._config.sensors):null,s=e=>!t||t.has(e),i=[],a=new Set,r=new Set(["power","energy","current","voltage","apparent_power","reactive_power","power_factor","frequency"]),o=new Map;for(const t of e.entities){const e=this.hass.states[t.entity_id];if(!e||"unavailable"===e.state||"unknown"===e.state)continue;const s=e.attributes?.device_class??"";r.has(s)&&(o.has(s)||o.set(s,[]),o.get(s).push(t.entity_id))}const n=new Set([...o.entries()].filter(([,e])=>e.length>1).map(([e])=>e)),l=(e,t,s,r=!1,o)=>{const l=o&&n.has(e)?`${e}_${this._chLabel(o)}`:e;a.has(l)||(a.add(l),i.push({label:t,value:s,warn:r}))};if(e.isVirtual){const t=e.entities[0];if(!t)return i;const s=this.hass.states[t.entity_id];if(!s)return i;const a=s.attributes;if("automation"===t.domain){const e="off"===s.state;l("state","State",e?"Off":"On",e),l("last_run","Last run",this._timeAgo(a.last_triggered));const t=a.mode;t&&"single"!==t&&l("mode","Mode",t)}else if("script"===t.domain)l("state","State","on"===s.state?"Running":"Off");else if("input_boolean"===t.domain)l("state","State","on"===s.state?"On":"Off");else if("input_number"===t.domain){const e=a.unit_of_measurement??"";l("value","Value",e?`${s.state} ${e}`:s.state)}else if("input_text"===t.domain){l("text","Text",(s.state.length>20?s.state.slice(0,20)+"…":s.state)||"—")}else if("input_select"===t.domain)l("option","Option",s.state);else if("input_datetime"===t.domain){const e=s.state,t=e.match(/^(\d{4}-\d{2}-\d{2})[T ](\d{2}:\d{2})/),i=e.match(/^(\d{2}:\d{2})/);l("datetime","Date/Time",t?`${t[1]} ${t[2]}`:i?i[1]:e)}else if("input_button"===t.domain)l("pressed","Pressed",this._timeAgo(a.timestamp));else if("timer"===t.domain){l("status","Status",{idle:"Idle",active:"Active",paused:"Paused"}[s.state]??s.state),"active"!==s.state&&"paused"!==s.state||!a.remaining||l("left","Left",a.remaining)}else"counter"===t.domain&&l("count","Count",s.state);return i}for(const t of e.entities){const e=this.hass.states[t.entity_id];if(!e||"unavailable"===e.state||"unknown"===e.state)continue;const i=e.attributes.device_class??"",a=t.entity_id;if("sensor"===t.domain){if(!i&&(a.endsWith("_ip")||a.endsWith("_ip_address"))&&s("ip")){l("ip","IP",e.state);continue}if(!i&&a.endsWith("_ssid")&&s("ssid")){l("ssid","SSID",e.state);continue}if(!i&&(a.endsWith("_firmware")||a.endsWith("_fw"))&&s("fw_version")){l("fw_version","FW",e.state);continue}if(!i&&a.endsWith("_mac")&&s("mac")){l("mac","MAC",e.state);continue}const t=parseFloat(e.state);if(isNaN(t))continue;const r=n.size?this._chLabel(a):"",o=e=>n.has(e)&&r?` ${r}`:"";"power"===i&&s("power")?l("power",`Power${o("power")}`,ze(t),!1,a):"apparent_power"===i&&s("apparent_power")?l("apparent_power",`App.P${o("apparent_power")}`,De(t),!1,a):"reactive_power"===i&&s("reactive_power")?l("reactive_power",`Re.P${o("reactive_power")}`,Fe(t),!1,a):"power_factor"===i&&s("power_factor")?l("power_factor",`PF${o("power_factor")}`,Ue(t),!1,a):"frequency"===i&&s("frequency")?l("frequency",`Freq${o("frequency")}`,Re(t),!1,a):"energy"===i&&s("energy")?l("energy",`Energy${o("energy")}`,Te(t),!1,a):"voltage"===i&&s("voltage")?l("voltage",`Volt${o("voltage")}`,Pe(t),!1,a):"current"===i&&s("current")?l("current",`Curr${o("current")}`,Me(t),!1,a):"temperature"===i&&s("temperature")?l("temperature","Temp",Oe(t)):"humidity"===i&&s("humidity")?l("humidity","Hum",Be(t)):"illuminance"===i&&s("illuminance")?l("illuminance","Light",Ne(t)):"carbon_dioxide"===i&&s("co2")?l("co2","CO₂",He(t)):"gas"===i&&s("gas")?l("gas","Gas",`${t.toFixed(1)} %`):"battery"===i&&s("battery")?l("battery","Batt",Ue(t)):("signal_strength"===i||a.includes("rssi"))&&s("rssi")?l("rssi","Wi-Fi",`${Ie(t)} (${t} dBm)`):a.includes("uptime")&&s("uptime")&&l("uptime","Uptime",Ee(t))}else if("binary_sensor"===t.domain){const t="on"===e.state;"motion"===i&&s("motion")?l("motion","Motion",t?"Motion":"Clear"):"door"!==i&&"window"!==i&&"opening"!==i||!s("door")?"moisture"===i&&s("flood")?l("flood","Flood",t?"Flooded":"Dry",t):"smoke"===i&&s("smoke")?l("smoke","Smoke",t?"Smoke!":"Clear",t):"gas"===i&&s("gas")?l("gas","Gas",t?"Gas!":"Clear",t):"vibration"===i&&s("vibration")?l("vibration","Vibr",t?"Vibrating":"Clear"):("heat"===i||a.includes("overtemp"))&&s("overtemp")?l("overtemp","Overtemp",t?"Overtemp!":"OK",t):("safety"===i||a.includes("overpower"))&&s("overpower")?l("overpower","Overpower",t?"Overpower!":"OK",t):"connectivity"===i&&a.includes("cloud")&&s("cloud")?l("cloud","Cloud",t?"Connected":"Offline",!t):"connectivity"===i&&a.includes("mqtt")&&s("mqtt")?l("mqtt","MQTT",t?"Connected":"Offline",!t):"connectivity"===i&&a.includes("eth")&&s("eth")&&l("eth","Ethernet",t?"Connected":"Offline",!t):l("door","Door",t?"Open":"Closed")}}return i}_getInputChannels(e){return e.entities.filter(e=>"binary_sensor"===e.domain&&(e.entity_id.includes("input")||e.entity_id.includes("button")||null==e.attributes?.device_class)).map(e=>{const t=this.hass.states[e.entity_id],s=t?.attributes?.friendly_name??"",i=e.entity_id.match(/(?:input|channel|button)[_\s]*(\d+)/i)??s.match(/(\d+)\s*$/),a=i?parseInt(i[1]):0;return{entityId:e.entity_id,label:i?`${a}`:"?",fullName:s||e.entity_id,isOn:"on"===t?.state,channel:a}}).sort((e,t)=>e.channel-t.channel)}async _toggle(e,t,s){s.stopPropagation();const i=e.split(".")[0];await this.hass.callService(i,t?"turn_off":"turn_on",{entity_id:e})}async _setBrightness(e,t){await this.hass.callService("light","turn_on",{entity_id:e,brightness_pct:Math.max(1,Math.min(100,t))})}_rgbToHex(e,t,s){return"#"+[e,t,s].map(e=>e.toString(16).padStart(2,"0")).join("")}_hexToRgb(e){return[parseInt(e.slice(1,3),16),parseInt(e.slice(3,5),16),parseInt(e.slice(5,7),16)]}async _setColor(e,t,s,i=!1){const a=this._hexToRgb(t);i&&void 0!==s?await this.hass.callService("light","turn_on",{entity_id:e,rgbw_color:[...a,s]}):await this.hass.callService("light","turn_on",{entity_id:e,rgb_color:a})}async _coverAction(e,t,s){s.stopPropagation();await this.hass.callService("cover",{open:"open_cover",close:"close_cover",stop:"stop_cover"}[t],{entity_id:e})}async _setCoverPosition(e,t){await this.hass.callService("cover","set_cover_position",{entity_id:e,position:Math.round(Math.max(0,Math.min(100,t)))})}async _valveAction(e,t,s){s.stopPropagation();await this.hass.callService("valve",{open:"open_valve",close:"close_valve",stop:"stop_valve"}[t],{entity_id:e})}async _setTemp(e,t){await this.hass.callService("climate","set_temperature",{entity_id:e,temperature:Math.round(2*t)/2})}async _setHvacMode(e,t,s){s.stopPropagation(),await this.hass.callService("climate","set_hvac_mode",{entity_id:e,hvac_mode:t})}_setPresetMode(e,t){this.hass.callService("climate","set_preset_mode",{entity_id:e,preset_mode:t})}async _installUpdate(e,t){t.stopPropagation(),await this.hass.callService("update","install",{entity_id:e})}_getGraphEntities(e){const t=this._config.graph_sensors??[];if(!t.length)return[];const s=[];for(const i of t){const t=e.entities.filter(e=>{if("sensor"!==e.domain)return!1;return(this.hass.states[e.entity_id]?.attributes?.device_class??e.attributes?.device_class)===i||"signal_strength"===i&&e.entity_id.includes("rssi")}),a=new Set;for(const e of t){const r=this.hass.states[e.entity_id]?.attributes?.unit_of_measurement??"",o=t.length>1?this._chLabel(e.entity_id).replace("Ch ",""):"",n=(Le[i]??i)+(o?` ${o}`:"");a.has(n)||(a.add(n),s.push({entityId:e.entity_id,label:n,dc:i,unit:r}))}}return s}_requestGraphData(e){if(this._graphFetching.has(e))return;Date.now()-(this._graphFetchedAt.get(e)??0)<3e5&&this._graphData.has(e)||(this._fetchQueue.includes(e)||this._fetchQueue.push(e),this._drainFetchQueue())}_drainFetchQueue(){if(this._fetchQueueRunning||0===this._fetchQueue.length)return;this._fetchQueueRunning=!0;const e=this._fetchQueue.shift();Promise.resolve().then(async()=>{await this._fetchGraphData(e),this._fetchQueueRunning=!1,this._drainFetchQueue()})}_retryGraphData(e){if(this._graphFetching.has(e))return;this._graphFetchedAt.delete(e);const t=new Map(this._graphData);t.delete(e),this._graphData=t,this._fetchQueue=this._fetchQueue.filter(t=>t!==e),this._requestGraphData(e)}_refreshAllGraphs(e){const t=this._getGraphEntities(e).map(e=>e.entityId).filter(e=>!this._graphFetching.has(e));t.forEach(e=>this._graphFetchedAt.delete(e));const s=new Map(this._graphData);t.forEach(e=>s.delete(e)),this._graphData=s,t.forEach(e=>this._fetchGraphData(e))}async _fetchGraphData(e){this._graphFetching.add(e);try{const t=this._config.graph_hours??24,s=`history/period/${new Date(Date.now()-36e5*t).toISOString()}?filter_entity_id=${e}&minimal_response=true&no_attributes=true`,i=await this.hass.callApi("GET",s);let a=(i?.[0]??[]).map(e=>({t:new Date(e.last_changed).getTime(),v:parseFloat(e.state)})).filter(e=>!isNaN(e.v));if(1===a.length){const t=parseFloat(this.hass.states[e]?.state??"");a.push({t:Date.now(),v:isNaN(t)?a[0].v:t})}const r=new Map(this._graphData);r.set(e,a),this._graphData=r}catch(t){console.warn("[ha-device-dashboard] history fetch failed",e,t);const s=new Map(this._graphData);s.set(e,[]),this._graphData=s}finally{this._graphFetchedAt.set(e,Date.now()),this._graphFetching.delete(e)}}_renderSparklines(e){const t=this._getGraphEntities(e);if(!t.length)return V``;const s=this._config.graph_style??{},i=200,a=s.height??32,r=null!=s.height,o=s.line_width??1.5,n=!1!==s.show_dots,l=!1!==s.tick_lines,c=!1!==s.time_labels,d=s.type??"line",p="area"===d,h=this._config.graph_hours??24,g=h<=1?6e4:h<=5?12e4:3e5,u=this._config.graph_sensor_colors??{},v=this._config.graph_line_color,b=e=>new Date(e).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}),f=t.map(({entityId:e,label:t,unit:s,dc:h})=>{const f=u[h]??v??je.find(e=>e.key===h)?.defaultColor??"#f4601e",m=this._graphData.get(e);if(this._requestGraphData(e),!m)return V`
          <div class="spark-row">
            <span class="spark-lbl">${t}</span>
            <div class="sparkline-loading" style="height:${r?a:32}px"></div>
            <span class="spark-val">—</span>
          </div>`;if(m.length<2)return V`
          <div class="spark-row">
            <span class="spark-lbl">${t}</span>
            <span class="spark-no-data">no history</span>
            <button class="spark-retry" @click=${t=>{t.stopPropagation(),this._retryGraphData(e)}}>↺</button>
          </div>`;const _=m.map(e=>e.v),x=Math.min(..._),y=Math.max(..._),$=y-x||1,w=m[0].t,k=m[m.length-1].t,S=k-w||1,A=e=>(e.t-w)/S*i,C=e=>a-4-(e.v-x)/$*(a-8),z=m.map(e=>`${A(e).toFixed(1)},${C(e).toFixed(1)}`).join(" "),T=A(m[0]).toFixed(1),P=`sg-${e.replace(/[^a-z0-9]/gi,"")}`,M=_[_.length-1],O=M%1==0?`${M}`:M.toFixed(1),E=_.indexOf(y),I=_.indexOf(x),D=A(m[E]).toFixed(1),F=C(m[E]).toFixed(1),R=A(m[I]).toFixed(1),B=C(m[I]).toFixed(1),N=b(m[0].t),H=b((m[0].t+k)/2),U=g/S*i,j=`${Math.max(.3,.7*U).toFixed(2)} ${Math.max(.3,.3*U).toFixed(2)}`,L=n&&y-x>0;return V`
        <div class="spark-group">
          <div class="spark-row">
            <span class="spark-lbl">${t}</span>
            <div class="spark-svg-wrap">
              <svg viewBox="0 0 ${i} ${a}" preserveAspectRatio="none"
                class="sparkline-svg"
                style="height:${r?a:32}px"
                @mousemove=${e=>{const t=e.currentTarget,a=t.getBoundingClientRect(),r=Math.max(0,Math.min(1,(e.clientX-a.left)/a.width)),o=w+r*S;let n=m[0];for(const e of m)Math.abs(e.t-o)<Math.abs(n.t-o)&&(n=e);const l=A(n),c=C(n),d=t.querySelector(".spark-crosshair");d&&(d.setAttribute("x1",String(l)),d.setAttribute("x2",String(l)),d.style.display="");const p=t.querySelector(".spark-hover-dot");p&&(p.setAttribute("cx",String(l)),p.setAttribute("cy",String(c)),p.style.display="");const h=t.parentElement,g=h?.querySelector(".spark-tooltip");if(g){const e=g.querySelector(".spark-tooltip-val"),t=g.querySelector(".spark-tooltip-time");e&&(e.textContent=`${n.v%1==0?String(n.v):n.v.toFixed(1)} ${s}`),t&&(t.textContent=b(n.t)),g.style.left=`${(l/i*100).toFixed(1)}%`,g.style.display=""}}} @mouseleave=${e=>{const t=e.currentTarget;t.querySelector(".spark-crosshair")?.style&&(t.querySelector(".spark-crosshair").style.display="none"),t.querySelector(".spark-hover-dot")?.style&&(t.querySelector(".spark-hover-dot").style.display="none");const s=t.parentElement?.querySelector(".spark-tooltip");s&&(s.style.display="none")}}>
                <defs>
                  <linearGradient id="${P}" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="${f}" stop-opacity="0.3"/>
                    <stop offset="100%" stop-color="${f}" stop-opacity="0"/>
                  </linearGradient>
                </defs>
                ${l?q`
                  <line x1="0"        x2="0"        y1="0" y2="${a}" class="spark-tick"/>
                  <line x1="${100}" x2="${100}" y1="0" y2="${a}" class="spark-tick"/>
                  <line x1="${i}"     x2="${i}"     y1="0" y2="${a}" class="spark-tick"/>
                `:W}
                ${"bar"!==d&&p?q`
                  <polygon points="${z} ${i},${a-4} ${T},${a-4}" fill="url(#${P})"/>
                `:W}
                ${"bar"===d?m.map(e=>{const t=Math.max(2,i/m.length-2),s=A(e)-t/2,r=C(e),o=a-4-r;return q`<rect x="${s.toFixed(1)}" y="${r.toFixed(1)}" width="${t.toFixed(1)}" height="${Math.max(0,o).toFixed(1)}" rx="1.5" fill="${f}" opacity="0.75"/>`}):q`
                    <polyline points="${z}" fill="none"
                      stroke="${f}" stroke-width="${o}"
                      stroke-linecap="round" stroke-linejoin="round"/>
                  `}
                <line x1="0" y1="${a}" x2="${i}" y2="${a}"
                  stroke="rgba(255,255,255,0.5)" stroke-width="0.8"
                  stroke-dasharray="${j}" pointer-events="none"
                  vector-effect="non-scaling-stroke"/>
                ${L?q`
                  <circle cx="${D}" cy="${F}" r="3"
                    fill="${f}" stroke="#1e1e2e" stroke-width="1.2"/>
                  <circle cx="${R}" cy="${B}" r="2.5"
                    fill="#6b7280" stroke="#1e1e2e" stroke-width="1.2"/>
                `:W}
                <line class="spark-crosshair" x1="0" x2="0" y1="0" y2="${a}" style="display:none"/>
                <circle class="spark-hover-dot" cx="0" cy="0" r="3.5" style="display:none"/>
              </svg>
              <div class="spark-tooltip" style="display:none">
                <span class="spark-tooltip-val"></span>
                <span class="spark-tooltip-time"></span>
              </div>
            </div>
            <span class="spark-val">${O} ${s}</span>
          </div>
          ${c?V`
            <div class="spark-time-row">
              <div class="spark-time-spacer"></div>
              <div class="spark-time-labels">
                <span>${N}</span><span>${H}</span><span>now</span>
              </div>
              <div class="spark-time-end"></div>
            </div>
          `:W}
        </div>`});return V`
      <div class="sparklines-block">
        ${f}
      </div>`}_getBlockOrder(e,t){const s=this._config.device_styles?.[e.device_id]?.tile_layout;return s||(this._config.tile_layout?this._config.tile_layout:Ae[t.type]??Ae.generic)}_trvColor(e){const t=Math.max(0,Math.min(1,e));let s,i,a;if(t<.5){const e=2*t;s=Math.round(74+156*e),i=Math.round(144+-18*e),a=Math.round(217+-183*e)}else{const e=2*(t-.5);s=Math.round(230+-1*e),i=Math.round(126+-69*e),a=Math.round(34+19*e)}return`rgb(${s},${i},${a})`}_renderTrvDial(e){const{minTemp:t,maxTemp:s,targetTemp:i,currentTemp:a}=e,r=100,o=i??t,n=Math.max(0,Math.min(1,(o-t)/(s-t))),l=e=>210+(e-t)/(s-t)*300,c=(e,t)=>[r+t*Math.cos((e-90)*Math.PI/180),95+t*Math.sin((e-90)*Math.PI/180)],d=(e,t,s)=>{const[i,a]=c(e,s),[r,o]=c(t,s);return`M ${i} ${a} A ${s} ${s} 0 ${t-e>180?1:0} 1 ${r} ${o}`},p=this._trvColor(n),h=l(o),[g,u]=c(h,72),v=null!=a?(a-t)/(s-t):null,b=null!=a?c(l(a),72):null,f=null!=v?this._trvColor(v):p,m=`trv-grad-${this._getTrv.name}`;return q`
      <svg viewBox="0 0 200 155" class="trv-dial-svg">
        <defs>
          <linearGradient id="${m}" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%"   stop-color="${this._trvColor(0)}"/>
            <stop offset="50%"  stop-color="${this._trvColor(.5)}"/>
            <stop offset="100%" stop-color="${this._trvColor(1)}"/>
          </linearGradient>
        </defs>
        <!-- full track with blue→red gradient -->
        <path d="${d(210,510,72)}" fill="none" stroke="url(#${m})" stroke-width="10" stroke-linecap="round" opacity="0.25"/>
        <!-- fill arc to target -->
        ${h>210?q`<path d="${d(210,h,72)}" fill="none" stroke="url(#${m})" stroke-width="10" stroke-linecap="round"/>`:W}
        <!-- current temp dot -->
        ${b?q`<circle cx="${b[0]}" cy="${b[1]}" r="6" fill="white" stroke="${f}" stroke-width="2.5"/>`:W}
        <!-- target handle -->
        <circle cx="${g}" cy="${u}" r="10" fill="${p}" stroke="white" stroke-width="2.5"/>
        <!-- center: target temp -->
        <text x="${r}" y="${81}" text-anchor="middle" class="dial-target-text">${o.toFixed(1)}°</text>
        <text x="${r}" y="${99}" text-anchor="middle" class="dial-sub-text">target</text>
        <text x="${r}" y="${115}" text-anchor="middle" class="dial-current-text">${null!=a?`now ${a}°`:""}</text>
        <!-- min/max labels -->
        <text x="22" y="148" text-anchor="middle" class="dial-range-text">${t}°</text>
        <text x="178" y="148" text-anchor="middle" class="dial-range-text">${s}°</text>
      </svg>
    `}_valvePosFromEvent(e,t){const s=t.getBoundingClientRect(),i=(e.clientX-s.left)*(200/s.width),a=(e.clientY-s.top)*(145/s.height);let r=Math.atan2(a-90,i-100)*(180/Math.PI)+90;r<0&&(r+=360);const o=(r-210+360)%360;return o>300?null:Math.round(o/300*100)}_renderValveDial(e){const t=e.position??("open"===e.state?100:0),s=(e,t)=>[100+t*Math.cos((e-90)*Math.PI/180),90+t*Math.sin((e-90)*Math.PI/180)],i=(e,t,i)=>{const[a,r]=s(e,i),[o,n]=s(t,i);return`M ${a} ${r} A ${i} ${i} 0 ${t-e>180?1:0} 1 ${o} ${n}`},a=(e=>210+e/100*300)(t),[r,o]=s(a,72),n=`hsl(${200+.2*t}, ${40+.55*t}%, ${38+.18*t}%)`,l="opening"===e.state?"Opening…":"closing"===e.state?"Closing…":100===t?"Open":0===t?"Closed":"Partial";return q`
      <svg viewBox="0 0 200 145" class="trv-dial-svg valve-interactive"
        @pointerdown=${t=>{t.stopPropagation();const s=t.currentTarget;s.setPointerCapture(t.pointerId);const i=t=>{const i=this._valvePosFromEvent(t,s);null!=i&&this._setValvePosition(e.entityId,i)},a=t=>{const r=this._valvePosFromEvent(t,s);null!=r&&this._setValvePosition(e.entityId,r),s.removeEventListener("pointermove",i),s.removeEventListener("pointerup",a)};s.addEventListener("pointermove",i),s.addEventListener("pointerup",a);const r=this._valvePosFromEvent(t,s);null!=r&&this._setValvePosition(e.entityId,r)}}>
        <defs>
          <linearGradient id="valve-grad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%"   stop-color="#6b7280"/>
            <stop offset="100%" stop-color="#0ea5e9"/>
          </linearGradient>
        </defs>
        <!-- wide invisible hit area on the track -->
        <path d="${i(210,510,72)}" fill="none" stroke="transparent" stroke-width="28" stroke-linecap="round"/>
        <path d="${i(210,510,72)}" fill="none" stroke="url(#valve-grad)" stroke-width="10" stroke-linecap="round" opacity="0.25"/>
        ${t>0?q`<path d="${i(210,a,72)}" fill="none" stroke="url(#valve-grad)" stroke-width="10" stroke-linecap="round"/>`:W}
        <circle cx="${r}" cy="${o}" r="12" fill="${n}" stroke="white" stroke-width="2.5" style="cursor:grab"/>
        <text x="${100}" y="${80}" text-anchor="middle" class="dial-target-text">${Math.round(t)}%</text>
        <text x="${100}" y="${98}" text-anchor="middle" class="dial-sub-text">${l}</text>
        <text x="22" y="138" text-anchor="middle" class="dial-range-text">Closed</text>
        <text x="178" y="138" text-anchor="middle" class="dial-range-text">Open</text>
      </svg>
    `}_renderBlock(e,t,s){const i=this._getPrimarySwitch(t),a=this._getTrv(t),r=this._getCover(t);this._getValve(t);const o=this._getAlerts(t),n=this._isOnline(t),l=this._getFirmware(t),c=this._getPower(t),d=this._getSensors(t),p=this._getInputChannels(t),h=i?.isOn??!1,g=void 0!==i?.brightness,u=g&&h?Math.max(1,i.brightness??1):0,v=!!i?.colorModes?.length,b=v&&i.rgbColor?this._rgbToHex(...i.rgbColor):"#ffffff",f=v&&(i.colorModes?.some(e=>"rgbw"===e||"rgbww"===e)??!1),m="heat"===a?.hvacMode,_="ble"===s.gen?"BLE":"other"===s.gen?"":`G${s.gen}`,x=(y=t.integration,Ce[y.toLowerCase()]??y.toUpperCase().slice(0,6));var y,$;switch(e){case"name_row":return V`
          <div class="tile-top">
            <div class="tile-left">
              <span class="dot ${n?"online":"offline"}"></span>
              <span class="tile-name">${t.name}</span>
              ${l?V`<span class="update-dot" title="Firmware update">●</span>`:W}
            </div>
            ${r?V`
              <div class="cov-btns" @click=${e=>e.stopPropagation()}>
                <button class="cov-btn" @click=${e=>this._coverAction(r.entityId,"open",e)}>▲</button>
                <button class="cov-btn stop" @click=${e=>this._coverAction(r.entityId,"stop",e)}>■</button>
                <button class="cov-btn" @click=${e=>this._coverAction(r.entityId,"close",e)}>▼</button>
              </div>
            `:i?V`
              <button class="tog ${h?"on":"off"}"
                @click=${e=>this._toggle(i.entityId,h,e)}>
                ${h?"ON":"OFF"}
              </button>
            `:a?V`
              <button class="tog ${m?"on":"off"}"
                @click=${e=>this._setHvacMode(a.entityId,m?"off":"heat",e)}>
                ${m?"HEAT":"OFF"}
              </button>
            `:t.isVirtual?V`
              <button class="tog off"
                @click=${async e=>{e.stopPropagation();const s=t.entities[0];s&&("script"===s.domain?await this.hass.callService("script","turn_on",{entity_id:s.entity_id}):"scene"===s.domain?await this.hass.callService("scene","turn_on",{entity_id:s.entity_id}):"automation"===s.domain?await this.hass.callService("automation","trigger",{entity_id:s.entity_id}):"input_button"===s.domain?await this.hass.callService("input_button","press",{entity_id:s.entity_id}):"input_boolean"===s.domain&&await this.hass.callService("input_boolean","toggle",{entity_id:s.entity_id}))}}>
                RUN
              </button>
            `:W}
          </div>
        `;case"sensors":return d.length?V`
          <div class="tile-sensor-chips">
            ${d.map(e=>V`
              <div class="tile-sensor-chip ${e.warn?"warn":""}">
                <span class="tsc-lbl">${e.label}</span>
                <span class="tsc-val">${e.value}</span>
              </div>
            `)}
          </div>
        `:V``;case"graph":return this._renderSparklines(t);case"dimmer":return i&&g?V`
          <div class="tile-dim-row" @click=${e=>e.stopPropagation()}>
            ${v?V`
              <input type="color" class="color-swatch tile-color-swatch" .value=${b}
                ?disabled=${!h}
                @change=${e=>{e.stopPropagation(),this._setColor(i.entityId,e.target.value,i.whiteValue,f)}}/>
            `:W}
            <input type="range" class="dim-slider" min="1" max="100"
              style=${xe(v?{accentColor:b}:{})}
              .value=${String(h?Math.max(1,i.brightness??1):1)}
              ?disabled=${!h}
              @input=${e=>{const t=e.target.closest(".tile-dim-row")?.querySelector(".dim-pct");t&&(t.textContent=`${e.target.value}%`)}}
              @change=${e=>{this._setBrightness(i.entityId,parseInt(e.target.value,10))}}/>
            <span class="dim-pct">${u}%</span>
          </div>
        `:V``;case"cover_controls":return r?V`
          <div class="cov-pos-row" @click=${e=>e.stopPropagation()}>
            <div class="cov-bar">
              <div class="cov-fill" style="width:${r.position??("open"===r.state?100:0)}%"></div>
            </div>
            <span class="cov-pct">${null!=r.position?`${Math.round(r.position)}%`:r.state}</span>
          </div>
        `:V``;case"trv_control":{const e=t.entities.find(e=>"sensor"===e.domain&&"battery"===this.hass.states[e.entity_id]?.attributes?.device_class),s=null!=e&&parseFloat(this.hass.states[e.entity_id]?.state??"")||null,i={comfort:"🏠",eco:"🌿",boost:"🚀",away:"🌙",none:"❄️"};return a?V`
          <div class="tile-trv-dial" @click=${e=>e.stopPropagation()}>
            ${this._renderTrvDial(a)}
            <div class="trv-dial-btns">
              <button class="trv-step" @click=${()=>null!=a.targetTemp&&this._setTemp(a.entityId,Math.max(a.minTemp,a.targetTemp-a.step))}>−</button>
              <span class="trv-flame">${"heating"===a.hvacAction?"🔥":""}</span>
              <button class="trv-step" @click=${()=>null!=a.targetTemp&&this._setTemp(a.entityId,Math.min(a.maxTemp,a.targetTemp+a.step))}>+</button>
            </div>
            <div class="trv-stat-row">
              <div class="trv-stat"><span class="trv-stat-lbl">Now</span><span class="trv-stat-val">${null!=a.currentTemp?`${a.currentTemp}°`:"—"}</span></div>
              <div class="trv-stat"><span class="trv-stat-lbl">Set</span><span class="trv-stat-val">${null!=a.targetTemp?`${a.targetTemp.toFixed(1)}°`:"—"}</span></div>
              ${null!=a.valvePosition?V`<div class="trv-stat"><span class="trv-stat-lbl">Valve</span><span class="trv-stat-val">${Math.round(a.valvePosition)}%</span></div>`:W}
              ${null!=s?V`<div class="trv-stat"><span class="trv-stat-lbl">Batt</span><span class="trv-stat-val">${s}%</span></div>`:W}
            </div>
            ${a.presetModes.length?V`
              <div class="trv-presets">
                ${a.presetModes.map(e=>V`
                  <button class="trv-preset-btn ${a.presetMode===e?"active":""}"
                    @click=${()=>this._setPresetMode(a.entityId,e)}>
                    ${(i[e]??"")+e}
                  </button>
                `)}
              </div>
            `:W}
          </div>
        `:V``}case"input_channels":return p.length?V`
          <div class="tile-inputs" @click=${e=>e.stopPropagation()}>
            ${p.map(e=>V`
              <div class="input-chip ${e.isOn?"active":""}">
                <span class="input-dot"></span>
                <span class="input-lbl">${e.label}</span>
              </div>
            `)}
          </div>
        `:V``;case"fan_controls":{const e=this._getFan(t);return e?V`
          <div class="tile-dim-row" @click=${e=>e.stopPropagation()}>
            <input type="range" class="dim-slider" min="0" max="100" step="${e.percentageStep}"
              .value=${String(e.isOn?e.percentage??0:0)}
              ?disabled=${!e.isOn}
              @change=${t=>{t.stopPropagation();const s=parseInt(t.target.value,10);this.hass.callService("fan",s>0?"turn_on":"turn_off",{entity_id:e.entityId,...s>0?{percentage:s}:{}})}}/>
            <span class="dim-pct">${e.isOn?e.percentage??0:0}%</span>
            ${void 0!==e.oscillating?V`
              <button class="tog sm ${e.oscillating?"on":"off"}"
                @click=${t=>{t.stopPropagation(),this.hass.callService("fan","oscillate",{entity_id:e.entityId,oscillating:!e.oscillating})}}>
                ⟳
              </button>
            `:W}
          </div>
        `:V``}case"valve_controls":{const e=this._getValve(t);return e?V`
          <div class="tile-trv-dial" @click=${e=>e.stopPropagation()}>
            ${this._renderValveDial(e)}
            <div class="valve-dial-btns">
              <button class="valve-btn close" @click=${t=>this._valveAction(e.entityId,"close",t)}>Close</button>
              <button class="valve-btn stop" @click=${t=>this._valveAction(e.entityId,"stop",t)}>■</button>
              <button class="valve-btn open" @click=${t=>this._valveAction(e.entityId,"open",t)}>Open</button>
            </div>
          </div>
        `:V``}case"media_controls":{const e=this._getMedia(t);return e?V`
          <div class="tile-media-row" @click=${e=>e.stopPropagation()}>
            ${e.title?V`<span class="media-title">${e.title}${e.artist?V` · <em class="media-artist">${e.artist}</em>`:W}</span>`:W}
            <div class="media-btns">
              <button class="cov-btn" title="Previous"
                @click=${t=>{t.stopPropagation(),this.hass.callService("media_player","media_previous_track",{entity_id:e.entityId})}}>⏮</button>
              <button class="cov-btn" title="${e.isPlaying?"Pause":"Play"}"
                @click=${t=>{t.stopPropagation(),this.hass.callService("media_player",e.isPlaying?"media_pause":"media_play",{entity_id:e.entityId})}}>
                ${e.isPlaying?"⏸":"▶"}
              </button>
              <button class="cov-btn" title="Next"
                @click=${t=>{t.stopPropagation(),this.hass.callService("media_player","media_next_track",{entity_id:e.entityId})}}>⏭</button>
              <button class="cov-btn ${e.isMuted?"stop":""}" title="${e.isMuted?"Unmute":"Mute"}"
                @click=${t=>{t.stopPropagation(),this.hass.callService("media_player","volume_mute",{entity_id:e.entityId,is_volume_muted:!e.isMuted})}}>
                ${e.isMuted?"🔇":"🔊"}
              </button>
            </div>
            ${null!=e.volume?V`
              <input type="range" class="dim-slider" min="0" max="100" step="5"
                .value=${String(Math.round(100*(e.volume??0)))}
                @change=${t=>{t.stopPropagation(),this.hass.callService("media_player","volume_set",{entity_id:e.entityId,volume_level:parseInt(t.target.value)/100})}}/>
            `:W}
          </div>
        `:V``}case"power_bar":return this._renderPowerBar(t);case"badges":return V`
          <div class="tile-bot">
            ${null!=c?V`<span class="tile-power">${ze(c)}</span>`:W}
            <div class="tile-badges">
              ${o.map(e=>V`<span class="alert-badge alert-${e}">${"overtemp"===e?"🌡":"⚡"}!</span>`)}
              ${s.label?V`<span class="type-badge type-${s.type}">${s.label}</span>`:W}
              ${_?V`<span class="gen-badge gen-${s.gen}">${_}</span>`:W}
              ${x&&!t.isVirtual?V`<span class="int-badge-tile">${x}</span>`:W}
              ${t.isShelly&&t.ip&&($=t.ip,/^10\./.test($)||/^192\.168\./.test($)||/^172\.(1[6-9]|2\d|3[01])\./.test($)||/^169\.254\./.test($))?V`
                <a href="http://${t.ip}" target="_blank" class="tile-ui-link"
                  @click=${e=>e.stopPropagation()}>↗</a>
              `:W}
            </div>
          </div>
        `;default:return V``}}_renderPowerBar(e){if(!this._config.show_power_bar)return V``;const t=this._getPower(e)??0,s=this._config.power_bar_max??2e3;return V`
      <div class="power-bar" title="${t.toFixed(0)} W">
        <div class="power-bar-fill" style="width:${Math.min(100,t/s*100)}%"></div>
      </div>`}_renderTile(e){const t=this._isOnline(e),s=function(e){const t=(e.model??"").toLowerCase(),s=new Set(e.entities.map(e=>e.domain));if(e.isVirtual){const t=e.entities[0]?.domain??"generic",s="script"===t?"script":"scene"===t?"scene":"automation"===t?"automation":"weather"===t?"weather":"person"===t?"person":$e.has(t)?"helper":"generic";return{type:s,gen:"other",label:Se[s],integration:e.integration}}let i;if(s.has("climate")&&s.has("switch"))i="wall_display";else if(s.has("climate"))i="climate";else if(s.has("cover"))i="cover";else if(s.has("valve"))i="valve";else if(s.has("vacuum"))i="vacuum";else if(s.has("fan"))i="fan";else if(s.has("lock"))i="lock";else if(s.has("alarm_control_panel"))i="alarm";else if(s.has("humidifier"))i="humidifier";else if(s.has("media_player"))i="media_player";else if(s.has("camera"))i="camera";else if(s.has("light")){const t=e.entities.some(e=>"light"===e.domain&&(e.attributes?.supported_color_modes??[]).some(e=>["rgb","rgbw","rgbww","hs","xy"].includes(e)));i=t?"rgb":"dimmer"}else if(s.has("switch"))i=e.isShelly?t.includes("uni")?"uni":!t.includes("plug")&&(e.entities.some(e=>"binary_sensor"===e.domain&&e.entity_id.includes("input"))||t.includes("1pm")||t.includes("2pm")||t.includes("pro "))?"relay":"plug":t.includes("plug")||t.includes("outlet")?"plug":"switch";else{const t=e.entities.some(e=>"sensor"===e.domain&&("power"===e.attributes?.device_class||"energy"===e.attributes?.device_class||"apparent_power"===e.attributes?.device_class)),s=e.entities.some(e=>"binary_sensor"===e.domain&&(e.entity_id.includes("input")||e.entity_id.includes("button"))),a=e.entities.some(e=>"sensor"===e.domain&&["temperature","humidity","illuminance","moisture","battery","gas"].includes(e.attributes?.device_class??"")),r=e.entities.some(e=>"binary_sensor"===e.domain&&["motion","door","window","moisture","smoke","gas","vibration","opening"].includes(e.attributes?.device_class??""));i=t?"energy":!s||a||r?"sensor":"input"}const a=e.isShelly?function(e){const t=e.toLowerCase();return t.includes("blu")||t.includes("bluetooth")?"ble":t.includes("g4")||t.includes("gen4")||t.includes("gen 4")?4:t.includes("g3")||t.includes("gen3")||t.includes("gen 3")||/^s3/i.test(e)?3:t.includes("plus")||t.includes("pro")||/^sn/i.test(e)?2:1}(e.model??""):"other";return{type:i,gen:a,label:Se[i],integration:e.integration}}(e),i=this._config.tile_size??"md",a=this._config.device_styles?.[e.device_id]?.color,r={};a&&(r.borderColor=a,r.boxShadow=`0 0 12px ${a}50`);const o=this._config.device_styles?.[e.device_id]?.tile_layout??this._config.tile_layout??Ae[s.type]??["name_row","sensors","graph","dimmer","cover_controls","trv_control","media_controls","fan_controls","valve_controls","input_channels","power_bar","badges"];return V`
      <div class="tile ${t?"":"offline"} tile-${i}"
        style=${xe(r)}>
        ${o.map(t=>this._renderBlock(t,e,s))}
      </div>
    `}_getAreaChips(e){const t=this._config.sensors?.length?new Set(this._config.sensors):null,s=e=>!t||t.has(e),i={},a=(e,t)=>{i[e]||(i[e]={sum:0,count:0}),i[e].sum+=t,i[e].count++};for(const t of e)for(const e of t.entities){if("sensor"!==e.domain)continue;const t=this.hass.states[e.entity_id];if(!t||"unavailable"===t.state||"unknown"===t.state)continue;const i=parseFloat(t.state);if(isNaN(i))continue;const r=t.attributes.device_class??"";"power"===r&&s("power")?a("power",i):"energy"===r&&s("energy")?a("energy",i):"temperature"===r&&s("temperature")?a("temperature",i):"humidity"===r&&s("humidity")?a("humidity",i):"carbon_dioxide"===r&&s("co2")?a("co2",i):"illuminance"===r&&s("illuminance")&&a("illuminance",i)}const r=[];return i.power&&r.push({label:"Power",value:ze(i.power.sum)}),i.energy&&r.push({label:"Energy",value:Te(i.energy.sum)}),i.temperature&&r.push({label:"Temp",value:Oe(i.temperature.sum/i.temperature.count)}),i.humidity&&r.push({label:"Hum",value:Be(i.humidity.sum/i.humidity.count)}),i.co2&&r.push({label:"CO₂",value:He(i.co2.sum/i.co2.count)}),i.illuminance&&r.push({label:"Light",value:Ne(i.illuminance.sum/i.illuminance.count)}),r}_renderAreaSection(e,t){if(!t.length)return V``;const s=e||"No Area",i=this._closedAreas.has(e),a=t.filter(e=>this._isOnline(e)).length,r=t.reduce((e,t)=>e+(this._getPower(t)??0),0),o=this._config.area_styles?.[s],n=o?.columns??this._config.columns??3;this._config.style;const l={};o&&(o.bgImage?(l.backgroundImage=`url('${o.bgImage}')`,l.backgroundSize="stretch"===o.bgImageSize?"100% 100%":o.bgImageSize??"contain",l.backgroundPosition="center",l.backgroundRepeat="no-repeat"):o.bgColor&&(l.background=o.bgColor),(o.borderColor||o.borderWidth)&&(l.border=`${o.borderWidth??1}px ${o.borderStyle??"solid"} ${o.borderColor??"var(--divider-color)"}`),o.borderRadius&&(l.borderRadius=`${o.borderRadius}px`,l.overflow="hidden"),o.headerBgColor&&(l["--area-header-bg"]=o.headerBgColor2?`linear-gradient(${o.headerBgDir??"to right"}, ${o.headerBgColor}, ${o.headerBgColor2})`:o.headerBgColor),o.textColor&&(l["--area-header-color"]=o.textColor),o.fontSize&&(l["--area-name-size"]=`${o.fontSize}px`),o.fontWeight&&(l["--area-name-weight"]=o.fontWeight),o.tileBgColor&&(l["--sc-tile-bg"]=o.tileBgColor),o.tileBorderColor&&(l["--sc-tile-border"]=o.tileBorderColor),null!=o.tileBorderRadius&&(l["--tile-radius"]=`${o.tileBorderRadius}px`),null!=o.tileGap&&(l["--tile-gap"]=`${o.tileGap}px`),o.tileTextColor&&(l["--sc-text-primary"]=o.tileTextColor),o.accentColor&&(l["--sc-accent"]=o.accentColor,l["--sc-graph-line"]=o.accentColor,l["--sc-accent-glow"]=`${o.accentColor}59`));const c=t.map(e=>this._renderTile(e)),d=this._getAreaChips(t);return V`
      <div class="area-section ${i?"closed":""}" style=${xe(l)}>
        <div class="area-header" @click=${()=>{const t=new Set(this._closedAreas);t.has(e)?t.delete(e):t.add(e),this._closedAreas=t}}>
          <span class="area-name">${s}</span>
          ${d.length?V`
            <div class="area-chips">
              ${d.map(e=>V`
                <div class="area-chip">
                  <span class="tsc-lbl">${e.label}</span>
                  <span class="tsc-val">${e.value}</span>
                </div>`)}
            </div>`:W}
          <div class="area-meta">
            <span class="area-count">${a}/${t.length}</span>
            ${r>0?V`<span class="area-power">${ze(r)}</span>`:W}
            <span class="chevron ${i?"":"open"}">▼</span>
          </div>
        </div>
        ${i?W:V`
          <div class="device-grid" style="--cols:${n}">
            ${c}
          </div>
        `}
      </div>
    `}_renderExpanded(e){const t=this._getSensors(e),s=this._getFirmware(e),i=this._getTrv(e),a=this._getCover(e),r=this._getValve(e),o=!1!==this._config.show_entity_list,n=this._entityListOpen.has(e.device_id);return V`
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
            `:W}
          </div>
        `:W}

        ${i?V`
          <div class="exp-section exp-section--trv">
            <div class="exp-label">Thermostat</div>
            <div class="trv-ctrl-row">
              <button class="trv-big-btn" @click=${e=>{e.stopPropagation(),null!=i.targetTemp&&this._setTemp(i.entityId,Math.max(i.minTemp,i.targetTemp-i.step))}}>−</button>
              <div class="trv-display">
                <span class="trv-target-big">${null!=i.targetTemp?i.targetTemp.toFixed(1):"—"}°</span>
                ${null!=i.currentTemp?V`<span class="trv-current-sub">now ${i.currentTemp}°</span>`:W}
                ${"heating"===i.hvacAction?V`<span class="trv-action-badge heating">Heating</span>`:W}
              </div>
              <button class="trv-big-btn" @click=${e=>{e.stopPropagation(),null!=i.targetTemp&&this._setTemp(i.entityId,Math.min(i.maxTemp,i.targetTemp+i.step))}}>+</button>
            </div>
            <div class="dim-wrap" style="margin:4px 0 8px">
              <span class="trv-range-lbl">${i.minTemp}°</span>
              <input type="range" class="dim-slider" .min=${String(i.minTemp)} .max=${String(i.maxTemp)} .step=${String(i.step)}
                style="accent-color:var(--sc-accent)" .value=${String(i.targetTemp??i.minTemp)}
                @change=${e=>{e.stopPropagation(),this._setTemp(i.entityId,parseFloat(e.target.value))}}/>
              <span class="trv-range-lbl">${i.maxTemp}°</span>
            </div>
            <div class="trv-mode-row">
              <button class="tog sm ${"heat"===i.hvacMode?"on":"off"}" @click=${e=>this._setHvacMode(i.entityId,"heat",e)}>Heat</button>
              <button class="tog sm ${"off"===i.hvacMode?"on":"off"}" @click=${e=>this._setHvacMode(i.entityId,"off",e)}>Off</button>
            </div>
          </div>
        `:W}

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
            `:W}
          </div>
        `:W}

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
        `:W}

        ${s?V`
          <div class="exp-section">
            <div class="exp-label">Firmware update available</div>
            <div class="exp-row">
              <span class="exp-name">${s.newVersion??"New version"}</span>
              <button class="tog sm update" @click=${e=>this._installUpdate(s.entityId,e)}>Install</button>
            </div>
          </div>
        `:W}

        ${o?V`
          <div class="exp-section exp-section--full">
            <div class="ent-list-header" @click=${t=>{t.stopPropagation();const s=new Set(this._entityListOpen);n?s.delete(e.device_id):s.add(e.device_id),this._entityListOpen=s}}>
              <span class="exp-label" style="margin:0">All Entities (${e.entities.length})</span>
              <span class="ent-caret ${n?"open":""}">▼</span>
            </div>
            ${n?V`
              <div class="ent-list">
                ${e.entities.filter(e=>!(this._config.hidden_entities??[]).includes(e.entity_id)).map(e=>{const t=this.hass.states[e.entity_id],s=t?.state??"unavailable",i=t?.attributes?.unit_of_measurement??"",a=t?.attributes?.friendly_name??e.entity_id.split(".")[1].replace(/_/g," "),r=["switch","light","input_boolean","fan"].includes(e.domain);return V`
                      <div class="ent-row">
                        <span class="ent-domain">${e.domain}</span>
                        <span class="ent-name">${a}</span>
                        <span class="ent-state">${i?`${s} ${i}`:s}</span>
                        ${r?V`
                          <button class="tog sm ${"on"===s?"on":"off"}"
                            @click=${t=>this._toggle(e.entity_id,"on"===s,t)}>
                            ${"on"===s?"ON":"OFF"}
                          </button>
                        `:W}
                      </div>
                    `})}
              </div>
            `:W}
          </div>
        `:W}

      </div>
    `}render(){if(!this._config||!this.hass)return V``;const e=new Set(["hui-card-picker","hui-cards-used-card-picker"]);let t=this,s=!1;for(;t;){if(t instanceof Element&&e.has(t.tagName.toLowerCase())){s=!0;break}const i=t.getRootNode();if(i===t||i===document)break;t=i.host}if(s)return V`
        <ha-card>
          <div style="padding:20px;text-align:center;color:var(--secondary-text-color,#9ca3af);">
            <div style="font-size:2em;margin-bottom:8px">📡</div>
            <div style="font-weight:600;margin-bottom:4px">HA Device Dashboard</div>
            <div style="font-size:.85em">Add the card to configure rooms and devices</div>
          </div>
        </ha-card>`;const i=this._getDevices(),a=this._config.style??{};if(!i.length)return V`
        <ha-card>
          <div class="empty">
            <p>No devices found.</p>
            <p class="hint">No devices found matching your filters.</p>
          </div>
        </ha-card>`;const r=i.filter(e=>this._isOnline(e)).length,o=i.length-r,n=i.reduce((e,t)=>e+(this._getPower(t)??0),0),l=i.filter(e=>this._getAlerts(e).length>0),c=this._groupByArea(i),d={};a.accent_color&&(d["--sc-accent"]=a.accent_color),a.tile_radius&&(d["--tile-radius"]=`${a.tile_radius}px`),a.tile_gap&&(d["--tile-gap"]=`${a.tile_gap}px`),a.font_family&&(d["--sc-font-family"]=a.font_family),a.text_transform&&(d["--sc-text-transform"]=a.text_transform),a.text_size_scale&&(d["--sc-text-scale"]=String(a.text_size_scale)),a.tile_bg&&(d["--sc-tile-bg"]=a.tile_bg),a.tile_bg_image&&(d["--sc-tile-bg-image"]=`url("${a.tile_bg_image}")`),a.tile_bg_image_size&&(d["--sc-tile-bg-image-sz"]="stretch"===a.tile_bg_image_size?"100% 100%":a.tile_bg_image_size),this._config.card_bg_image&&(d["--sc-card-bg-image"]=`url("${this._config.card_bg_image}")`),this._config.card_bg_image_size&&(d["--sc-card-bg-image-sz"]="stretch"===this._config.card_bg_image_size?"100% 100%":this._config.card_bg_image_size),a.tile_border&&(d["--sc-tile-border"]=a.tile_border),a.text_primary&&(d["--sc-text-primary"]=a.text_primary),a.online_color&&(d["--sc-online-color"]=a.online_color),a.power_color&&(d["--sc-power-color"]=a.power_color),this._config.graph_line_color&&(d["--sc-graph-line"]=this._config.graph_line_color);const p=a.button_shape??"pill",h=a.button_variant??"fill",g=a.button_size??"md",u={sm:"2px 8px",md:"4px 11px",lg:"6px 16px"},v={sm:"3px 5px",md:"4px 8px",lg:"6px 12px"},b="square"===p||"circle"===p;d["--tog-radius"]="pill"===p?"20px":"rect"===p||"square"===p?"6px":"50%",d["--tog-pad"]=b?v[g]??v.md:u[g]??u.md,d["--tog-fsize"]="sm"===g?".65em":"lg"===g?".8em":".72em",d["--tog-aspect"]=b?"1":"auto","outline"===h?(d["--tog-on-bg"]="transparent",d["--tog-on-border"]="1px solid var(--sc-accent)",d["--tog-on-color"]="var(--sc-accent)",d["--tog-on-shadow"]="none"):"ghost"===h&&(d["--tog-on-bg"]="transparent",d["--tog-on-border"]="none",d["--tog-on-color"]="var(--sc-accent)",d["--tog-on-shadow"]="none"),a.header_bg&&a.header_bg2?d["--sc-header-bg"]=`linear-gradient(135deg, ${a.header_bg} 0%, ${a.header_bg2} 100%)`:a.header_bg&&(d["--sc-header-bg"]=a.header_bg);const f=a.card_bg??"var(--ha-card-background, #1c1c1e)";a.card_bg&&(d["--sc-card-bg"]=a.card_bg);const m=this._config.card_opacity??100;m<100&&(d["--sc-card-bg"]=`color-mix(in srgb, ${f} ${m}%, transparent)`);const _=this._config.tile_opacity??100;return _<100&&(d["--sc-tile-bg-opacity"]=String(_/100)),V`
      <ha-card style=${xe(d)}>
        <div class="dash-header">
          <span class="dash-title">HA Devices</span>
          <div class="dash-stats">
            <span class="stat online">${r}/${i.length} online</span>
            ${o>0?V`<span class="stat offline-count">${o} offline</span>`:W}
            <span class="stat power">${ze(n)}</span>
            ${l.length>0?V`<span class="stat alerts-count">⚠ ${l.length}</span>`:W}
          </div>
        </div>
        <div class="dash-body">
          ${[...c.entries()].map(([e,t])=>this._renderAreaSection(e,t))}
        </div>
      </ha-card>
    `}};var Ge,We;qe.BRIGHTNESS_MAX=255,qe.styles=o`
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
      --sc-offline-dot:     #4b5563;
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
      --sc-tile-bg-opacity: 1;
    }

    ha-card {
      overflow-x: hidden; overflow-y: visible;
      background: var(--sc-card-bg-image) center / var(--sc-card-bg-image-sz) no-repeat, var(--sc-card-bg);
      container-type: inline-size; container-name: ha-dash;
      font-family: var(--sc-font-family);
    }

    .dash-header {
      position: relative; display: flex; align-items: center; justify-content: space-between;
      padding: 16px 18px 14px; background: var(--sc-header-bg); overflow: hidden;
    }
    .dash-header::before,.dash-header::after {
      content:''; position:absolute; border-radius:50%; filter:blur(40px); opacity:0.5;
      animation: drift 8s ease-in-out infinite alternate;
    }
    .dash-header::before { width:120px;height:120px; background:var(--sc-accent); top:-40px;left:-20px; }
    .dash-header::after  { width:100px;height:100px; background:var(--sc-header-orb2); bottom:-30px;right:20px; animation-delay:-4s; }
    @keyframes drift { from{transform:translate(0,0) scale(1)} to{transform:translate(15px,8px) scale(1.15)} }

    .dash-title {
      font-size:1.1em; font-weight:800; color:var(--sc-header-text);
      letter-spacing:0.02em; position:relative; z-index:1;
      display:flex; align-items:center; gap:8px;
    }
    .dash-title::before { content:'⚡'; }

    .dash-stats { display:flex; gap:8px; align-items:center; position:relative; z-index:1; }
    .stat { font-size:0.78em; padding:3px 10px; border-radius:20px; font-weight:600; backdrop-filter:blur(4px); }
    .stat.online   { background:var(--sc-online-bg);  color:var(--sc-online-color); border:1px solid var(--sc-online-border); }
    .stat.power    { background:color-mix(in srgb,var(--sc-accent) 20%,transparent); color:var(--sc-power-color); border:1px solid color-mix(in srgb,var(--sc-accent) 30%,transparent); }
    .stat.offline-count { background:rgba(75,85,99,.25); color:#9ca3af; border:1px solid rgba(75,85,99,.35); }
    .stat.alerts-count  { background:rgba(239,68,68,.2); color:#fca5a5; border:1px solid rgba(239,68,68,.3); animation:blink 2s step-end infinite; }

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
    .area-name { font-size:var(--area-name-size,0.78em); font-weight:var(--area-name-weight,700); text-transform:var(--sc-text-transform,uppercase); letter-spacing:0.08em; color:var(--area-header-color,var(--sc-accent)); }
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
      border:1px solid var(--sc-tile-border);
      border-radius:var(--tile-radius); padding:11px 13px; cursor:pointer;
      transition:transform 0.15s, box-shadow 0.15s;
      display:flex; flex-direction:column; gap:6px; position:relative; overflow:hidden;
      isolation:isolate;
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
    .type-media_player{ background:rgba(26,188,156,.20);  color:#5eead4; }
    .type-script,.type-scene,.type-automation { background:rgba(99,102,241,.20); color:#c4b5fd; }
    .type-helper      { background:rgba(156,163,175,.20); color:#d1d5db; }
    .type-script.type-badge,.type-scene.type-badge,.type-automation.type-badge,.type-helper.type-badge { font-size:18px; padding:4px 10px; border-radius:6px; }
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
    .trv-dial-svg { width:100%; height:auto; overflow:visible; }
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
    .valve-dial-btns { display:flex; align-items:center; gap:8px; margin-top:2px; }
    .valve-btn { padding:4px 14px; border-radius:8px; border:1px solid var(--sc-tog-off-border); background:var(--sc-tog-off-bg); color:var(--sc-text-primary); font-size:12px; font-weight:600; cursor:pointer; transition:background .15s; }
    .valve-btn:hover { background:rgba(255,255,255,.15); }
    .valve-btn.open:hover { background:#0ea5e9; border-color:#0ea5e9; color:#fff; }
    .valve-btn.close:hover { background:#6b7280; border-color:#6b7280; color:#fff; }
    .valve-btn.stop { color:var(--sc-text-muted); font-size:10px; }
    .valve-slider-row { display:flex; align-items:center; gap:6px; width:100%; padding:4px 8px 0; box-sizing:border-box; }

    .tile-inputs { display:flex; gap:5px; flex-wrap:wrap; padding:4px 0 2px; }
    .input-chip { display:flex; align-items:center; gap:4px; padding:4px 10px 4px 8px; border-radius:14px; border:1px solid rgba(255,255,255,.08); background:rgba(255,255,255,.05); font-size:12px; color:var(--sc-text-muted); transition:all .15s; }
    .input-chip.active { background:color-mix(in srgb,var(--sc-accent) 20%,transparent); color:var(--sc-accent); border-color:color-mix(in srgb,var(--sc-accent) 40%,transparent); }
    .input-dot { width:7px;height:7px; border-radius:50%; background:currentColor; flex-shrink:0; }
    .input-lbl { font-weight:600; }

    .tile-media-row { display:flex; flex-direction:column; gap:5px; padding:2px 0 0; }
    .media-title { font-size:.72em; color:var(--sc-text-secondary); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:100%; }
    .media-artist { font-style:normal; color:var(--sc-text-muted); }
    .media-btns { display:flex; gap:3px; }

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
  `,e([ue({attribute:!1})],qe.prototype,"hass",void 0),e([ue({type:Boolean})],qe.prototype,"preview",void 0),e([ve()],qe.prototype,"_config",void 0),e([ve()],qe.prototype,"_closedAreas",void 0),e([ve()],qe.prototype,"_entityListOpen",void 0),e([ve()],qe.prototype,"_graphData",void 0),qe=Ve=e([pe("ha-device-dashboard")],qe),function(e){e.language="language",e.system="system",e.comma_decimal="comma_decimal",e.decimal_comma="decimal_comma",e.space_comma="space_comma",e.none="none"}(Ge||(Ge={})),function(e){e.language="language",e.system="system",e.am_pm="12",e.twenty_four="24"}(We||(We={}));var Qe=function(e,t,s,i){i=i||{},s=null==s?{}:s;var a=new Event(t,{bubbles:void 0===i.bubbles||i.bubbles,cancelable:Boolean(i.cancelable),composed:void 0===i.composed||i.composed});return a.detail=s,e.dispatchEvent(a),a};const Je=[{label:"Default",value:void 0},{label:"Inter",value:"Inter, sans-serif"},{label:"Roboto",value:"Roboto, sans-serif"},{label:"Mono",value:"'IBM Plex Mono', monospace"},{label:"System",value:"system-ui, sans-serif"}],Ze=[{key:"shelly",label:"Shelly",badge:"SHELLY",color:"#f4601e",bg:"rgba(244,96,30,0.2)"},{key:"zha",label:"Zigbee Home Automation",badge:"ZHA",color:"#4a9eff",bg:"rgba(74,158,255,0.2)"},{key:"z2m",label:"Zigbee2MQTT",badge:"Z2M",color:"#a78bfa",bg:"rgba(167,139,250,0.2)"},{key:"hue",label:"Philips Hue",badge:"HUE",color:"#2dd4bf",bg:"rgba(45,212,191,0.2)"},{key:"esphome",label:"ESPHome",badge:"ESP",color:"#4ade80",bg:"rgba(74,222,128,0.2)"},{key:"mqtt",label:"MQTT",badge:"MQTT",color:"#fbbf24",bg:"rgba(251,191,36,0.2)"},{key:"tasmota",label:"Tasmota",badge:"TASMO",color:"#fb923c",bg:"rgba(251,146,60,0.2)"},{key:"matter",label:"Matter",badge:"MATTER",color:"#818cf8",bg:"rgba(129,140,248,0.2)"}],Ye=[{group:"Electrical",icon:"⊕",iconColor:"#4a9eff",iconBg:"rgba(74,158,255,0.1)",items:[{key:"power",label:"Power",unit:"W",defaultColor:"#f4601e"},{key:"voltage",label:"Voltage",unit:"V",defaultColor:"#a78bfa"},{key:"current",label:"Current",unit:"A",defaultColor:"#fbbf24"},{key:"energy",label:"Energy (kWh)",unit:"kWh",defaultColor:"#4ade80"},{key:"frequency",label:"Frequency",unit:"Hz",defaultColor:"#34d399"},{key:"apparent_power",label:"App. Power",unit:"VA",defaultColor:"#f472b6"},{key:"reactive_power",label:"React. Power",unit:"VAr",defaultColor:"#818cf8"},{key:"power_factor",label:"Power Factor",unit:"%",defaultColor:"#fb923c"}]},{group:"Environmental",icon:"◌",iconColor:"#4ade80",iconBg:"rgba(74,222,128,0.1)",items:[{key:"temperature",label:"Temperature",unit:"°C",defaultColor:"#4fc3f7"},{key:"humidity",label:"Humidity",unit:"%",defaultColor:"#2dd4bf"},{key:"illuminance",label:"Illuminance",unit:"lx",defaultColor:"#fde047"},{key:"co2",label:"CO₂",unit:"ppm",defaultColor:"#a3e635"},{key:"gas",label:"Gas",unit:"%",defaultColor:"#fb923c"}]},{group:"Device Info",icon:"◎",iconColor:"#a78bfa",iconBg:"rgba(167,139,250,0.1)",items:[{key:"cloud",label:"Cloud status",unit:"",defaultColor:"#7dd3fc"},{key:"rssi",label:"Wi-Fi RSSI",unit:"dBm",defaultColor:"#7dd3fc"},{key:"uptime",label:"Uptime",unit:"",defaultColor:"#86efac"},{key:"ip",label:"IP Address",unit:"",defaultColor:"#94a3b8"},{key:"ssid",label:"SSID",unit:"",defaultColor:"#94a3b8"},{key:"battery",label:"Battery",unit:"%",defaultColor:"#86efac"},{key:"fw_version",label:"Firmware",unit:"",defaultColor:"#94a3b8"},{key:"mac",label:"MAC Address",unit:"",defaultColor:"#94a3b8"}]},{group:"Alerts",icon:"⚠",iconColor:"#f87171",iconBg:"rgba(239,68,68,0.15)",items:[{key:"overtemp",label:"Overtemp",unit:"",defaultColor:"#f87171"},{key:"overpower",label:"Overpower",unit:"",defaultColor:"#f87171"},{key:"motion",label:"Motion",unit:"",defaultColor:"#f87171"},{key:"door",label:"Door / Window",unit:"",defaultColor:"#f87171"},{key:"flood",label:"Flood",unit:"",defaultColor:"#f87171"},{key:"smoke",label:"Smoke",unit:"",defaultColor:"#f87171"}]}],Ke=[{key:"power",label:"Power",unit:"W",color:"#f4601e"},{key:"voltage",label:"Voltage",unit:"V",color:"#a78bfa"},{key:"current",label:"Current",unit:"A",color:"#fbbf24"},{key:"energy",label:"Energy",unit:"kWh",color:"#4ade80"},{key:"apparent_power",label:"App. Power",unit:"VA",color:"#f472b6"},{key:"reactive_power",label:"React. Power",unit:"VAr",color:"#818cf8"},{key:"frequency",label:"Frequency",unit:"Hz",color:"#34d399"},{key:"power_factor",label:"Power Factor",unit:"%",color:"#fb923c"},{key:"temperature",label:"Temperature",unit:"°C",color:"#4fc3f7"},{key:"humidity",label:"Humidity",unit:"%",color:"#2dd4bf"},{key:"illuminance",label:"Illuminance",unit:"lx",color:"#fde047"},{key:"co2",label:"CO₂",unit:"ppm",color:"#a3e635"},{key:"battery",label:"Battery",unit:"%",color:"#86efac"},{key:"rssi",label:"RSSI",unit:"dBm",color:"#7dd3fc"}],Xe=[{id:"name_row",label:"Name row",sub:"Device name + status dot + primary control"},{id:"sensors",label:"Sensor chips",sub:"Power, temp, voltage, RSSI…"},{id:"graph",label:"Sparkline graph",sub:"History sparklines per selected sensor"},{id:"dimmer",label:"Dimmer / color",sub:"Brightness + color picker for lights"},{id:"cover_controls",label:"Cover controls",sub:"Open / stop / close + position"},{id:"trv_control",label:"TRV control",sub:"Thermostat display + ± buttons"},{id:"power_bar",label:"Power bar",sub:"Mini usage bar at tile bottom"},{id:"badges",label:"Type & gen badges",sub:"Dimmer · G3 · Relay labels"}],et=["style","tile_size","tile_opacity","card_opacity","card_bg_image","card_bg_image_size","tile_layout","graph_style","graph_sensors","graph_hours","graph_line_color","graph_sensor_colors","sensors","sort_by","view_mode","columns","show_power_bar","power_bar_max","area_styles","device_styles"];let tt=class extends ce{constructor(){super(...arguments),this._tab="devices",this._openSections={integrations:!0,rooms:!0,sortview:!1,grid:!0,tileorder:!0,colors:!0,tiles:!0,typography:!1,buttons:!1,roomstyles:!1,graphtype:!0,graphcolors:!1,electrical:!0,environmental:!0,deviceinfo:!1,alerts:!1},this._expandedRooms=new Set,this._expandedDevices=new Set,this._deviceSearch="",this._bgEditArea=null,this._styleTab={},this._hiddenBlocks=new Set(["badges"]),this._dragOrder=Xe.map(e=>e.id),this._dragOver=null,this._styleClipFeedback="",this._copyAreaOpen=!1,this._copyJson="",this._pasteOpen=!1,this._pasteText=""}setConfig(e){this._config=e}_set(e,t){if(!this._config)return;const s={...this._config,[e]:t};(""===t||void 0===t||Array.isArray(t)&&0===t.length&&"areas"!==e)&&delete s[e],Qe(this,"config-changed",{config:s})}_toggleSec(e){this._openSections={...this._openSections,[e]:!this._openSections[e]}}_showStyleFeedback(e){this._styleClipFeedback=e,clearTimeout(this._styleClipTimer),this._styleClipTimer=window.setTimeout(()=>{this._styleClipFeedback=""},1500)}_copyStyle(){const e={};for(const t of et){const s=this._config[t];void 0!==s&&(e[t]=s)}this._copyJson=JSON.stringify(e),this._copyAreaOpen=!0,this._pasteOpen=!1,navigator.clipboard.writeText(this._copyJson).catch(e=>{console.warn("[editor] clipboard write failed",e)})}_applyPastedStyle(){try{const e=JSON.parse(this._pasteText),t=et.some(t=>t in e);if(!t)return void this._showStyleFeedback("Invalid style data");const s={...this._config};for(const t of et)t in e&&(s[t]=e[t]);Qe(this,"config-changed",{config:s}),this._showStyleFeedback("Applied!"),this._pasteOpen=!1,this._pasteText=""}catch{this._showStyleFeedback("Invalid style data")}}_getAreas(){return this.hass?Object.values(this.hass.areas??{}).map(e=>({id:e.area_id,name:e.name})).sort((e,t)=>e.name.localeCompare(t.name)):[]}_getAllHADevices(){if(!this.hass)return[];const e=this.hass.devices??{},t=this.hass.entities??{},s=new Set,i=[];for(const a of Object.values(t)){const t=a?.device_id;if(!t||s.has(t))continue;s.add(t);const r=e[t];if(!r)continue;const o=r.area_id??a.area_id,n=o?this.hass.areas?.[o]?.name:void 0;i.push({device_id:t,name:r.name_by_user??r.name??t,area:n})}return i.sort((e,t)=>e.name.localeCompare(t.name))}_getDiscoveredDevices(){if(!this.hass)return[];const e=this._config.areas;let t=we(this.hass);if(void 0!==e){const s=new Set(e.map(e=>e.toLowerCase()));t=t.filter(e=>s.has((e.area??"").toLowerCase()))}return t.map(e=>({device_id:e.device_id,name:e.name,area:e.area})).sort((e,t)=>e.name.localeCompare(t.name))}_getEntitiesForDevice(e){const t=this.hass.entities??{},s=[];for(const[i,a]of Object.entries(t)){if(a.device_id!==e)continue;const t=this.hass.states[i];s.push({entity_id:i,name:t?.attributes?.friendly_name??i,domain:i.split(".")[0]})}return s.sort((e,t)=>e.name.localeCompare(t.name))}_setAreaStyle(e,t,s){const i={...this._config.area_styles?.[e]??{}};void 0===s||""===s?delete i[t]:i[t]=s;const a={...this._config.area_styles??{}};Object.keys(i).length?a[e]=i:delete a[e],this._set("area_styles",Object.keys(a).length?a:void 0)}_clearAreaStyle(e){const t={...this._config.area_styles??{}};delete t[e],this._set("area_styles",Object.keys(t).length?t:void 0)}_triggerUpload(e){this.renderRoot.querySelector(`input[data-upload="${e}"]`)?.click()}_handleUpload(e,t){const s=t.target.files?.[0];if(!s)return;const i=new FileReader;i.onload=()=>this._setAreaStyle(e,"bgImage",i.result),i.onerror=()=>{console.warn("[editor] failed to read file",s.name)},i.readAsDataURL(s),t.target.value=""}_handleTileBgUpload(e){const t=e.target.files?.[0];if(!t)return;const s=new FileReader;s.onload=()=>{const e=this._config.style??{};this._set("style",{...e,tile_bg_image:s.result})},s.onerror=()=>{console.warn("[editor] failed to read file",t.name)},s.readAsDataURL(t),e.target.value=""}_handleCardBgUpload(e){const t=e.target.files?.[0];if(!t)return;const s=new FileReader;s.onload=()=>{this._set("card_bg_image",s.result)},s.onerror=()=>{console.warn("[editor] failed to read file",t.name)},s.readAsDataURL(t),e.target.value=""}_sec(e,t,s,i,a,r,o){const n=this._openSections[e];return V`
      <div class="sec ${n?"open":""}">
        <div class="sec-hdr" @click=${()=>this._toggleSec(e)}>
          <div class="sec-hdr-l">
            <div class="sec-ico" style="background:${s};color:${i}">${t}</div>
            <span class="sec-title">${a}</span>
          </div>
          <div class="sec-hdr-r">${r}<span class="chev">▼</span></div>
        </div>
        <div class="sec-body">${o}</div>
      </div>`}_badge(e,t,s){return V`<span class="sec-badge" style="color:${t};background:${s}">${e}</span>`}_renderDevicesTab(){const e=this._config,t=e.integrations??[],s=this._getAreas(),i=s.map(e=>e.name),a=e.areas,r=e=>{const t=void 0===a?new Set(i):new Set(a);t.has(e)?t.delete(e):t.add(e);const s=t.size===i.length?void 0:[...t];this._set("areas",s)},o=this._getDiscoveredDevices(),n=this._getAllHADevices(),l=e.extra_devices??[],c=e.hidden_devices??[];e.hidden_entities;const d={};if(this.hass){const e=this.hass.entities??{};for(const t of Object.values(e)){const e=t.platform?.toLowerCase()??"";e&&(d[e]=(d[e]??0)+1)}}const p=Ze.map(e=>e.key),h=e=>{const s=0===t.length?new Set(p):new Set(t);s.has(e)?s.delete(e):s.add(e);const i=s.size===p.length?void 0:[...s];this._set("integrations",i)},g=new Map;for(const e of o){const t=e.area??"";g.has(t)||g.set(t,[]),g.get(t).push(e)}for(const e of l){if(o.find(t=>t.device_id===e))continue;const t=n.find(t=>t.device_id===e);if(!t)continue;const s=t.area??"";g.has(s)||g.set(s,[]),g.get(s).find(t=>t.device_id===e)||g.get(s).push({device_id:t.device_id,name:t.name})}const u=[...s.map(e=>e.name)];g.has("")&&u.push("");const v=this._deviceSearch.toLowerCase().trim(),b=v.length>=1?n.filter(e=>e.name.toLowerCase().includes(v)||(e.area??"").toLowerCase().includes(v)).slice(0,20):[],f=V`
      <div class="field-lbl">Show devices from</div>
      ${Ze.map(e=>{const s=0===t.length||t.includes(e.key),i=d[e.key]??0;return V`
          <div class="int-row">
            <span class="int-badge" style="color:${e.color};background:${e.bg}">${e.badge}</span>
            <span class="int-name">${e.label}</span>
            ${i?V`<span class="int-count">${i} entities</span>`:W}
            <label class="sw"><input type="checkbox" .checked=${s} @change=${()=>h(e.key)}><span class="sw-t"></span><span class="sw-b"></span></label>
          </div>`})}
      <div class="divider"></div>
      <div class="tog-row">
        <div><div class="tog-lbl">Include virtual entities</div><div class="tog-sub">Scripts, scenes, automations, helpers</div></div>
        <label class="sw"><input type="checkbox" .checked=${e.include_entities??!1} @change=${e=>this._set("include_entities",e.target.checked)}><span class="sw-t"></span><span class="sw-b"></span></label>
      </div>`,m=void 0===a?s.length:a.length,_=this._badge(`${m} / ${s.length}`,"#4ade80","rgba(74,222,128,0.1)"),x=V`
      ${u.map(t=>{const s=t||"No Room",i=g.get(t)??[],o=(e=>void 0===a||a.includes(e))(t),n=this._expandedRooms.has(t);return V`
          <div class="room-row">
            <div class="room-dot" style="background:${o?"#4ade80":"var(--t3)"}"></div>
            <span class="room-name" style="color:${o?"var(--text)":"var(--t2)"}">${s}</span>
            ${i.length?V`<span class="room-count">${i.length} devices</span>`:W}
            <label class="sw"><input type="checkbox" .checked=${o}
              @change=${()=>r(t)}>
              <span class="sw-t"></span><span class="sw-b"></span></label>
            <button class="room-style-btn" @click=${e=>{e.stopPropagation(),this._tab="style",this._openSections={...this._openSections,roomstyles:!0},this._expandedRooms=new Set([...this._expandedRooms,t])}}>Style ›</button>
            <button class="room-style-btn" @click=${e=>{e.stopPropagation();const s=new Set(this._expandedRooms);s.has(t)?s.delete(t):s.add(t),this._expandedRooms=s}}>${n?"▲":"Devices"}</button>
          </div>
          ${n?V`
            <div class="room-devices">
              ${i.length?i.map(t=>{const s=c.includes(t.device_id),i=!!e.device_styles?.[t.device_id],a=this._expandedDevices.has(t.device_id);return V`
                  <div class="room-device-row">
                    <span class="room-device-name" style="color:${s?"var(--t3)":"var(--t2)"}">${t.name}</span>
                    ${i?V`<span class="dev-style-dot"></span>`:W}
                    <label class="sw">
                      <input type="checkbox" .checked=${!s} @change=${()=>{const e=s?c.filter(e=>e!==t.device_id):[...c,t.device_id];this._set("hidden_devices",e.length?e:void 0)}}>
                      <span class="sw-t"></span><span class="sw-b"></span>
                    </label>
                    <button class="room-style-btn" @click=${e=>{e.stopPropagation();const s=new Set(this._expandedDevices);s.has(t.device_id)?s.delete(t.device_id):s.add(t.device_id),this._expandedDevices=s}}>${a?"▲":"Style"}</button>
                  </div>
                  ${a?this._renderDeviceStyleInline(t.device_id):W}`}):V`<div class="room-device-empty">No devices in this room</div>`}
            </div>
          `:W}`})}
      <!-- Extra device search -->
      <div class="room-extra">
        <div class="field-lbl" style="margin-top:10px">Pin extra devices</div>
        <div class="search-wrap">
          <span class="search-ico">⌕</span>
          <input type="text" placeholder="Search by name or area…" .value=${this._deviceSearch}
            @input=${e=>{this._deviceSearch=e.target.value}}/>
        </div>
        ${v.length>=1?V`
          <div class="search-results">
            ${b.length?b.map(e=>{const t=l.includes(e.device_id);return V`<div class="search-row ${t?"pinned":""}" @click=${()=>{t||(this._set("extra_devices",[...l,e.device_id]),this._deviceSearch="")}}>
                <span class="search-name">${e.name}</span>
                ${e.area?V`<span class="search-area">${e.area}</span>`:W}
                ${t?V`<span style="color:#f4601e;font-size:10px">✓</span>`:W}
              </div>`}):V`<div class="search-empty">No devices match "${v}"</div>`}
          </div>`:W}
        ${l.length?V`
          <div class="pinned-chips">
            ${l.map(e=>{const t=n.find(t=>t.device_id===e);return V`<span class="pinned-chip" @click=${()=>{const t=l.filter(t=>t!==e);this._set("extra_devices",t.length?t:void 0)}}>${t?.name??e} ✕</span>`})}
          </div>`:W}
      </div>`,y=V`
      <div class="field">
        <div class="field-lbl">Sort devices by</div>
        <div class="pill-grp">
          ${["name","power","online"].map(t=>V`
            <span class="pill ${(e.sort_by??"name")===t?"on":""}" @click=${()=>this._set("sort_by",t)}>${t[0].toUpperCase()+t.slice(1)}</span>`)}
        </div>
      </div>
      <div class="field">
        <div class="field-lbl">View mode</div>
        <div class="pill-grp">
          ${["grid","list","compact"].map(t=>V`
            <span class="pill ${(e.view_mode??"grid")===t?"on":""}" @click=${()=>this._set("view_mode",t)}>${t[0].toUpperCase()+t.slice(1)}</span>`)}
        </div>
      </div>
      <div class="tog-row">
        <div class="tog-lbl">Show offline devices</div>
        <label class="sw"><input type="checkbox" .checked=${!1!==e.show_offline} @change=${e=>this._set("show_offline",e.target.checked)}><span class="sw-t"></span><span class="sw-b"></span></label>
      </div>
      `;return V`
      ${this._sec("integrations","⬡","rgba(74,158,255,0.1)","#4a9eff","Integrations",this._badge("active","#4a9eff","rgba(74,158,255,0.1)"),f)}
      ${this._sec("rooms","⌂","rgba(74,222,128,0.1)","#4ade80","Rooms",_,x)}
      ${this._sec("sortview","⊞","rgba(167,139,250,0.1)","#a78bfa","Sort & View",W,y)}`}_setDeviceStyle(e,t){const s={...this._config.device_styles?.[e]??{},...t};void 0===s.color&&delete s.color,void 0===s.tile_layout&&delete s.tile_layout;const i={...this._config.device_styles??{},[e]:s};Object.keys(s).length||delete i[e],this._set("device_styles",Object.keys(i).length?i:void 0)}_renderDeviceStyleInline(e){const t=this._config.device_styles?.[e]??{},s=this._config.tile_layout??Xe.map(e=>e.id),i=t.tile_layout??null,a=t=>{const a=null===i?s.includes(t):i.includes(t),r=Xe.map(e=>e.id).filter(e=>e===t?!a:null===i?s.includes(e):i.includes(e)),o=r.length===s.length&&r.every(e=>s.includes(e));this._setDeviceStyle(e,{tile_layout:o?void 0:r})};return V`
      <div class="dev-style-panel">
        <div class="color-row">
          <span class="color-key">Accent colour</span>
          <span class="color-val">${t.color??"#f4601e"}</span>
          <input type="color" .value=${t.color??"#f4601e"}
            @change=${t=>this._setDeviceStyle(e,{color:t.target.value})}/>
          ${t.color?V`<button class="color-reset"
            @click=${()=>this._setDeviceStyle(e,{color:void 0})}>↺</button>`:W}
        </div>
        <div class="field-lbl" style="margin-bottom:4px">Visible blocks</div>
        <div class="block-toggles">
          ${Xe.map(e=>{const t=null===i?s.includes(e.id):i.includes(e.id);return V`<span class="block-tog ${t?"on":""}" @click=${()=>a(e.id)}>
              ${t?"👁":"○"} ${e.label}
            </span>`})}
        </div>
        <button class="room-style-btn" style="align-self:flex-end;margin-top:2px" @click=${()=>{const t={...this._config.device_styles??{}};delete t[e],this._set("device_styles",Object.keys(t).length?t:void 0)}}>Clear device style</button>
      </div>`}_renderRoomStyleInline(e){const t=this._config.area_styles?.[e]??{},s=this._styleTab[e]??"background",i=t=>{this._styleTab={...this._styleTab,[e]:t}},a=(s,i,a)=>V`
      <div class="color-row">
        <span class="color-key">${s}</span>
        <span class="color-val">${t[i]??a}</span>
        <input type="color" .value=${t[i]??a}
          @change=${t=>this._setAreaStyle(e,i,t.target.value)}/>
        ${t[i]?V`<button class="color-reset" @click=${()=>this._setAreaStyle(e,i,void 0)}>↺</button>`:W}
      </div>`,r=(s,i,a,r,o,n,l)=>V`
      <div class="sl-row">
        <span class="color-key">${s}</span>
        <input type="range" min="${a}" max="${r}" step="${o}" style="flex:1;accent-color:#f4601e"
          .value=${String(t[i]??n)}
          @input=${t=>this._setAreaStyle(e,i,parseInt(t.target.value,10))}/>
        <span class="sl-val">${t[i]??n}${l}</span>
      </div>`,o="background"===s?V`
        ${a("Color","bgColor","#1c1c1e")}
        <div class="color-row">
          <span class="color-key">Image</span>
          <input type="file" accept="image/*" hidden data-upload="${e}" @change=${t=>this._handleUpload(e,t)}/>
          <button class="upload-btn" @click=${()=>this._triggerUpload(e)}>↑ Upload</button>
          <input type="text" class="inline-text" placeholder="/local/img.jpg"
            .value=${t.bgImage?.startsWith("data:")?"(embedded)":t.bgImage??""}
            @change=${t=>{const s=t.target.value;this._setAreaStyle(e,"bgImage",s&&"(embedded)"!==s?s:void 0)}}/>
          ${t.bgImage?V`<button class="color-reset" @click=${()=>this._setAreaStyle(e,"bgImage",void 0)}>↺</button>`:W}
        </div>`:"header"===s?V`
        ${a("Gradient start","headerBgColor","#1a1a2e")}
        ${a("Gradient end","headerBgColor2","#0f3460")}
        ${a("Text color","textColor","#f4601e")}
        ${r("Font size","fontSize",8,32,1,12,"px")}`:"tiles"===s?V`
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
          ${Object.keys(t).length?V`<button class="clear-btn" @click=${()=>this._clearAreaStyle(e)}>Clear all</button>`:W}
        </div>
        <div class="style-tabs">
          ${["background","header","tiles","layout"].map(e=>V`
            <button class="stab ${s===e?"on":""}" @click=${()=>i(e)}>${e[0].toUpperCase()+e.slice(1)}</button>`)}
        </div>
        <div class="style-body">${o}</div>
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
      </div>`,s=V`
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
        ${this._dragOrder.map(e=>{const t=Xe.find(t=>t.id===e);if(!t)return W;const s=this._hiddenBlocks.has(e),i=this._dragOver===e;return V`
            <div class="drag-item ${s?"hidden-item":""} ${i?"drag-over":""}"
              draggable="true"
              @dragstart=${t=>{t.dataTransfer.setData("text",e),t.dataTransfer.effectAllowed="move"}}
              @dragenter=${t=>{t.preventDefault(),this._dragOver=e}}
              @dragover=${e=>{e.preventDefault()}}
              @dragleave=${()=>{this._dragOver===e&&(this._dragOver=null)}}
              @drop=${t=>{t.preventDefault();const s=t.dataTransfer.getData("text");if(!s||s===e)return void(this._dragOver=null);const i=[...this._dragOrder],a=i.indexOf(s),r=i.indexOf(e);i.splice(a,1),i.splice(r,0,s),this._dragOrder=i,this._dragOver=null,this._set("tile_layout",i.filter(e=>!this._hiddenBlocks.has(e)))}}>
              <div class="drag-handle"><span></span><span></span><span></span></div>
              <div style="flex:1">
                <div class="drag-label">${t.label}</div>
                <div class="drag-sub">${t.sub}</div>
              </div>
              <button class="drag-eye" @click=${()=>{const t=new Set(this._hiddenBlocks);t.has(e)?t.delete(e):t.add(e),this._hiddenBlocks=t;const s=this._dragOrder.filter(e=>!t.has(e));this._set("tile_layout",s)}} style="opacity:${s?.35:1}">👁</button>
            </div>`})}
      </div>`;return V`
      ${this._sec("grid","⊟","rgba(45,212,191,0.1)","#2dd4bf","Grid",W,t)}
      ${this._sec("tileorder","↕","rgba(244,96,30,0.12)","#f4601e","Tile Block Order",V`<span class="tag-new">Drag</span>`,s)}`}_renderStyleTab(){const e=this._config,t=e.style??{},s=V`
      ${[{label:"Dashboard BG",key:"card_bg",def:"#1c1c1e"},{label:"Accent / brand",key:"accent_color",def:"#f4601e"},{label:"Tile background",key:"tile_bg",def:"#1c1c1e"},{label:"Tile border",key:"tile_border",def:"#2a2a30"},{label:"Text primary",key:"text_primary",def:"#e5e7eb"},{label:"Online dot",key:"online_color",def:"#4ade80"},{label:"Power reading",key:"power_color",def:"#fb923c"}].map(({label:e,key:s,def:i})=>V`
        <div class="color-row">
          <span class="color-key">${e}</span>
          <span class="color-val">${t[s]??i}</span>
          <input type="color" .value=${t[s]??i}
            @change=${e=>this._set("style",{...t,[s]:e.target.value})}/>
          ${t[s]?V`<button class="color-reset" @click=${()=>{const e={...t};delete e[s],this._set("style",e)}}>↺</button>`:W}
        </div>`)}`,i=V`
      <div class="field">
        <div class="field-lbl">Font family</div>
        <div class="pill-grp">
          ${Je.map(e=>V`
            <span class="pill ${(t.font_family??void 0)===e.value?"on":""}"
              @click=${()=>{if(void 0===e.value){const{font_family:e,...s}=t;this._set("style",Object.keys(s).length?s:void 0)}else this._set("style",{...t,font_family:e.value})}}>${e.label}</span>`)}
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
      </div>`,a=t.button_shape??"pill",r=t.button_variant??"fill",o=t.button_size??"md",n="square"===a||"circle"===a,l=`border-radius:${"pill"===a?"20px":"rect"===a||"square"===a?"6px":"50%"};padding:${n?"sm"===o?"3px 5px":"lg"===o?"6px 12px":"4px 8px":"sm"===o?"2px 8px":"lg"===o?"6px 16px":"4px 12px"};font-size:${"sm"===o?"10px":"lg"===o?"13px":"11px"};aspect-ratio:${n?"1":"auto"};display:inline-flex;align-items:center;justify-content:center;`,c=V`
      <div class="btn-preview">
        <span class="preview-btn on" style="${l}${"outline"===r?"background:transparent;color:var(--accent);border:1px solid var(--accent);box-shadow:none":"ghost"===r?"background:transparent;color:var(--accent);border:none;box-shadow:none":"background:var(--accent);color:white;border:none"}">ON</span>
        <span class="preview-btn off" style="${l}">OFF</span>
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
          ${["sm","md","lg"].map((e,s)=>V`
            <span class="pill ${(t.button_size??"md")===e?"on":""}" @click=${()=>this._set("style",{...t,button_size:e})}>${["Small","Medium","Large"][s]}</span>`)}
        </div>
      </div>`,d=e.card_opacity??100,p=e.tile_opacity??100,h=t.tile_bg??"rgba(255,255,255,0.04)",g=t.card_bg??"#1c1c1e",u=t.tile_radius??12,v=t.tile_border??"rgba(255,255,255,0.07)",b=e.card_bg_image?`url('${e.card_bg_image}')`:"none",f="stretch"===e.card_bg_image_size?"100% 100%":e.card_bg_image_size??"cover",m=p<100?`color-mix(in srgb, ${h} ${p}%, transparent)`:h,_=V`
      <div class="transp-preview" style="background-color:${g};background-image:${b};background-size:${f};background-position:center;">
        <div class="transp-card-layer" style="background-color:${d<100?`color-mix(in srgb, ${g} ${d}%, transparent)`:g};">
          ${[0,1,2].map(e=>V`
            <div class="transp-tile" style="background-color:${m};border-radius:${u}px;border:1px solid ${v};">
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
          ${["sm","md","lg"].map((t,s)=>V`
            <span class="pill ${(e.tile_size??"md")===t?"on":""}" @click=${()=>this._set("tile_size",t)}>${["Small","Medium","Large"][s]}</span>`)}
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

      <div class="tiles-divider">Transparency</div>
      <div class="field">
        <div class="field-lbl">Card — <span style="color:#f4601e">${100-d}%</span></div>
        <input type="range" min="0" max="100" .value=${String(100-d)}
          @input=${e=>this._set("card_opacity",100-parseInt(e.target.value,10))}/>
      </div>
      <div class="field">
        <div class="field-lbl">Tiles — <span style="color:#f4601e">${100-p}%</span></div>
        <input type="range" min="0" max="100" .value=${String(100-p)}
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
          ${e.card_bg_image?V`<button class="color-reset" @click=${()=>{const e={...this._config};delete e.card_bg_image,delete e.card_bg_image_size,Qe(this,"config-changed",{config:e})}}>↺</button>`:W}
        </div>
        ${e.card_bg_image?V`
          <div class="field-lbl" style="margin-top:6px">Image fit</div>
          <div class="pill-grp">
            ${["cover","contain","stretch"].map(t=>V`
              <span class="pill ${(e.card_bg_image_size??"cover")===t?"on":""}"
                @click=${()=>this._set("card_bg_image_size",t)}>${t[0].toUpperCase()+t.slice(1)}</span>`)}
          </div>
        `:W}
      </div>
      <div class="field">
        <div class="field-lbl">Tile background image</div>
        <div class="bg-img-row">
          <input type="file" accept="image/*" hidden data-upload="tile-bg"
            @change=${e=>this._handleTileBgUpload(e)}/>
          <button class="upload-btn" @click=${()=>{this.renderRoot.querySelector('input[data-upload="tile-bg"]')?.click()}}>↑ Local</button>
          <input type="text" class="inline-text" placeholder="/local/image.png or https://…"
            .value=${t.tile_bg_image?.startsWith("data:")?"(embedded)":t.tile_bg_image??""}
            @change=${e=>{const s=e.target.value.trim(),i={...t};s&&"(embedded)"!==s?i.tile_bg_image=s:delete i.tile_bg_image,this._set("style",Object.keys(i).length?i:void 0)}}/>
          ${t.tile_bg_image?V`<button class="color-reset" @click=${()=>{const e={...t};delete e.tile_bg_image,delete e.tile_bg_image_size,this._set("style",Object.keys(e).length?e:void 0)}}>↺</button>`:W}
        </div>
        ${t.tile_bg_image?V`
          <div class="field-lbl" style="margin-top:6px">Image fit</div>
          <div class="pill-grp">
            ${["cover","contain","stretch"].map(e=>V`
              <span class="pill ${(t.tile_bg_image_size??"cover")===e?"on":""}"
                @click=${()=>this._set("style",{...t,tile_bg_image_size:e})}>${e[0].toUpperCase()+e.slice(1)}</span>`)}
          </div>
        `:W}
      </div>`,x=this._getAreas(),y=Object.keys(e.area_styles??{}).length,$=V`
      ${0===x.length?V`<div class="field-hint">No rooms configured in Home Assistant.</div>`:x.map(t=>{const s=this._expandedRooms.has(t.name),i=!(!e.area_styles?.[t.name]||!Object.keys(e.area_styles[t.name]).length);return V`
            <div class="room-style-row">
              <div class="room-style-hdr" @click=${()=>{const e=new Set(this._expandedRooms);e.has(t.name)?e.delete(t.name):e.add(t.name),this._expandedRooms=e}}>
                <span class="room-style-name">${t.name}</span>
                ${i?V`<span class="room-styled-dot"></span>`:W}
                <span class="room-style-chev">${s?"▲":"▼"}</span>
              </div>
              ${s?this._renderRoomStyleInline(t.name):W}
            </div>`})}`;return V`
      <div class="style-toolbar">
        <button class="btn-copy ${this._copyAreaOpen?"active":""}" @click=${()=>{this._copyStyle()}}>⧉ Copy style</button>
        <button class="btn-copy ${this._pasteOpen?"active":""}" @click=${()=>{this._pasteOpen=!this._pasteOpen,this._copyAreaOpen=!1}}>⬇ Paste style</button>
        ${this._styleClipFeedback?V`<span class="clip-feedback">${this._styleClipFeedback}</span>`:W}
      </div>
      ${this._copyAreaOpen?V`
        <div class="paste-area">
          <div style="font-size:10px;color:var(--t2);margin-bottom:2px">Select all and copy (Ctrl+A, Ctrl+C), then paste into another card's Paste style box</div>
          <textarea class="paste-ta" rows="3" readonly
            .value=${this._copyJson}
            @focus=${e=>{e.target.select()}}></textarea>
        </div>`:W}
      ${this._pasteOpen?V`
        <div class="paste-area">
          <div style="font-size:10px;color:var(--t2);margin-bottom:2px">Paste style JSON, then click Apply</div>
          <textarea class="paste-ta" rows="3" placeholder="Paste style JSON here…"
            .value=${this._pasteText}
            @input=${e=>{this._pasteText=e.target.value}}></textarea>
          <button class="btn-copy" @click=${()=>this._applyPastedStyle()}>Apply</button>
        </div>`:W}
      ${this._sec("colors","◐","rgba(244,96,30,0.12)","#f4601e","Colors",W,s)}
      ${this._sec("tiles","⊡","rgba(45,212,191,0.1)","#2dd4bf","Tiles",W,_)}
      ${this._sec("typography","T","rgba(251,191,36,0.1)","#fbbf24","Typography",W,i)}
      ${this._sec("buttons","⬭","rgba(74,222,128,0.1)","#4ade80","Buttons",W,c)}
      ${this._sec("roomstyles","⌂","rgba(74,222,128,0.08)","#4ade80","Per-Room Styles",y?this._badge(`${y} styled`,"#4ade80","rgba(74,222,128,0.1)"):W,$)}`}_renderGraphsTab(){const e=this._config,t=e.graph_style??{},s=t.type??"line",i=e.graph_sensor_colors??{},a=V`
      <div class="field">
        <div class="field-lbl">Type</div>
        <div class="pill-grp">
          ${["line","area","bar"].map(e=>V`
            <span class="pill ${s===e?"on":""}" @click=${()=>this._set("graph_style",{...t,type:e})}>${e[0].toUpperCase()+e.slice(1)}</span>`)}
        </div>
      </div>
      <div class="field" style="opacity:${"bar"===s?.4:1}">
        <div class="field-lbl">Line thickness — <span style="color:#f4601e">${t.line_width??1.5}px</span></div>
        <input type="range" min="0.5" max="4" step="0.5" ?disabled=${"bar"===s} .value=${String(t.line_width??1.5)}
          @input=${e=>this._set("graph_style",{...t,line_width:parseFloat(e.target.value)})}/>
      </div>
      <div class="tog-row">
        <div class="tog-lbl">Fill under curve</div>
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
      </div>`,r=e.graph_sensors??[],o=r.length?V`
      ${r.map(e=>{const t=Ke.find(t=>t.key===e),s=(e=>i[e]??Ke.find(t=>t.key===e)?.color??"#f4601e")(e),a=!!i[e];return V`
          <div class="color-row">
            <span class="color-key">${t?.label??e}</span>
            <span class="color-val">${s}</span>
            <input type="color" .value=${s}
              @change=${t=>{const s=t.target.value;this._set("graph_sensor_colors",{...i,[e]:s})}}/>
            ${a?V`<button class="color-reset" @click=${()=>{const t={...i};delete t[e],this._set("graph_sensor_colors",Object.keys(t).length?t:void 0)}}>↺</button>`:W}
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
      ${this._sec("graphtype","∿","rgba(45,212,191,0.1)","#2dd4bf","Graph Type",W,a)}
      ${this._sec("graphcolors","◐","rgba(244,96,30,0.12)","#f4601e","Per-sensor Colors",W,o)}`}_renderSensorsTab(){const e=this._config,t=e.sensors??[];return V`
      ${Ye.map(s=>{const i=s.items.map(e=>e.key),a=i.filter(e=>t.includes(e)).length,r=i.every(e=>t.includes(e)),o=this._badge(`${a||"All"} / ${s.items.length}`,s.iconColor,s.iconBg),n=V`
          <div class="sensors-hdr">
            <span class="sensors-hdr-lbl">${0===a?"All shown":`${a} selected`}</span>
            <button class="sensors-all-btn" @click=${e=>{e.stopPropagation();const s=r?t.filter(e=>!i.includes(e)):[...new Set([...t,...i])];this._set("sensors",s)}}>${r?"Deselect all":"Select all"}</button>
          </div>
          <div class="sensor-grid">
            ${s.items.map(i=>{const a=t.includes(i.key),r=!!Ke.find(e=>e.key===i.key),o=e.graph_sensors??[],n=o.includes(i.key);return V`
                <div class="sensor-item ${a?"active":""}" @click=${()=>{const e=a?t.filter(e=>e!==i.key):[...t,i.key];this._set("sensors",e)}}>
                  <div class="sensor-dot ${"Alerts"===s.group?"alert-dot":""}"></div>
                  <span class="sensor-name">${i.label}</span>
                  ${r?V`<button class="sensor-graph-btn ${n?"on":""}"
                    title="${n?"Remove graph":"Add graph"}"
                    @click=${e=>{e.stopPropagation();const t=n?o.filter(e=>e!==i.key):[...o,i.key];this._set("graph_sensors",t)}}>~</button>`:W}
                </div>`})}
          </div>`;return this._sec(s.group.toLowerCase().replace(" ",""),s.icon,s.iconBg,s.iconColor,s.group,o,n)})}`}_renderYamlTab(){const e=this._config,t=(e,s=0)=>{const i="  ".repeat(s);return Object.entries(e).map(([e,a])=>null==a?"":"object"!=typeof a||Array.isArray(a)?Array.isArray(a)?`${i}${e}:\n${a.map(e=>"object"==typeof e?`${i}  -\n${t(e,s+2)}`:`${i}  - ${e}`).join("\n")}`:`${i}${e}: ${a}`:`${i}${e}:\n${t(a,s+1)}`).filter(Boolean).join("\n")},s=t(e);return V`
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
        <div style="font-size:11px;color:#50505c;font-family:monospace">Generated config</div>
        <button class="btn-copy" @click=${async()=>{await navigator.clipboard.writeText(s).catch(e=>{console.warn("[editor] clipboard write failed",e)})}}>Copy</button>
      </div>
      <pre class="yaml-out">${s}</pre>`}render(){if(!this._config)return V``;this._config;return V`
      <div class="shell">
        <div class="tab-nav">
          ${[{id:"devices",label:"Devices"},{id:"layout",label:"Layout"},{id:"style",label:"Style"},{id:"graphs",label:"Graphs"},{id:"sensors",label:"Sensors"},{id:"yaml",label:"YAML"}].map(e=>V`
            <div class="tab ${this._tab===e.id?"active":""}" @click=${()=>{this._tab=e.id}}>${e.label}</div>`)}
        </div>
        <div class="tab-body">
          ${"devices"===this._tab?this._renderDevicesTab():"layout"===this._tab?this._renderLayoutTab():"style"===this._tab?this._renderStyleTab():"graphs"===this._tab?this._renderGraphsTab():"sensors"===this._tab?this._renderSensorsTab():this._renderYamlTab()}
        </div>
      </div>`}};tt.styles=o`
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
    .tab { font-size:11px; font-weight:500; letter-spacing:0.05em; text-transform:uppercase; padding:8px 14px; color:var(--t3); cursor:pointer; border-bottom:2px solid transparent; white-space:nowrap; transition:all .15s; border-radius:5px 5px 0 0; user-select:none; }
    .tab:hover { color:var(--t2); }
    .tab.active { color:var(--accent); border-bottom-color:var(--accent); }
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
    input[type="color"] { width:32px; height:28px; border:1px solid var(--border2); border-radius:5px; padding:2px 3px; background:var(--s2); cursor:pointer; flex-shrink:0; }
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

    /* ── Integration rows ── */
    .int-row { display:flex; align-items:center; gap:8px; padding:8px 0; border-bottom:1px solid var(--border); }
    .int-row:last-of-type { border-bottom:none; }
    .int-badge { font-size:9px; font-weight:700; padding:2px 7px; border-radius:3px; letter-spacing:0.06em; flex-shrink:0; min-width:52px; text-align:center; }
    .int-name { font-size:12px; color:var(--text); flex:1; }
    .int-count { font-size:10px; color:var(--t3); }

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
    .room-style-panel { margin:8px 0 12px; border:1px solid var(--border); border-radius:8px; overflow:hidden; }
    .style-panel-hdr { display:flex; align-items:center; justify-content:space-between; padding:8px 12px; background:var(--s2); font-size:12px; font-weight:600; }
    .clear-btn { font-size:10px; background:none; border:1px solid rgba(239,68,68,0.4); border-radius:4px; color:#ef4444; padding:3px 8px; cursor:pointer; }
    .style-tabs { display:flex; gap:4px; padding:6px 10px; background:var(--bg); border-bottom:1px solid var(--border); }
    .stab { flex:1; padding:5px 4px; border-radius:5px; font-size:10px; font-weight:600; text-align:center; cursor:pointer; border:1px solid var(--border); background:var(--s2); color:var(--t2); transition:all .12s; }
    .stab.on { background:var(--accentbg); border-color:var(--accentbdr); color:var(--accent); }
    .style-body { padding:10px 12px; }

    /* ── Search ── */
    .room-extra { margin-top:8px; }
    .search-wrap { display:flex; align-items:center; gap:6px; background:var(--s2); border:1px solid var(--border2); border-radius:8px; padding:7px 11px; margin-bottom:6px; }
    .search-wrap input { background:none; border:none; outline:none; font-size:12px; color:var(--text); width:100%; font-family:inherit; }
    .search-ico { color:var(--t3); font-size:13px; }
    .search-results { border:1px solid var(--border2); border-radius:8px; max-height:160px; overflow-y:auto; background:var(--s1); margin-bottom:6px; }
    .search-row { display:flex; align-items:center; gap:8px; padding:7px 12px; cursor:pointer; border-bottom:1px solid var(--border); transition:background .12s; }
    .search-row:hover { background:var(--s2); }
    .search-row.pinned { opacity:0.4; cursor:default; }
    .search-name { flex:1; font-size:11px; color:var(--text); }
    .search-area { font-size:9px; color:var(--t3); background:var(--s2); border-radius:8px; padding:1px 7px; }
    .search-empty { padding:10px 12px; font-size:11px; color:var(--t3); font-style:italic; }
    .pinned-chips { display:flex; flex-wrap:wrap; gap:5px; }
    .pinned-chip { font-size:10px; padding:4px 10px; border-radius:20px; border:1px solid var(--accentbdr); background:var(--accentbg); color:var(--accent); cursor:pointer; }
    .pinned-chip:hover { filter:brightness(1.2); }

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
    .sensor-graph-btn { margin-left:auto; flex-shrink:0; background:transparent; border:1px solid rgba(255,255,255,0.12); border-radius:4px; color:var(--t2); font-size:11px; padding:1px 5px; cursor:pointer; line-height:1.4; }
    .sensor-graph-btn.on { background:rgba(74,158,255,0.18); border-color:#4a9eff; color:#4a9eff; }
    .sensor-graph-btn:hover { border-color:rgba(255,255,255,0.3); }
    .sensor-grid { display:grid; grid-template-columns:1fr 1fr; gap:6px; }
    .sensor-item { display:flex; align-items:center; gap:8px; padding:7px 10px; background:var(--s2); border:1px solid var(--border); border-radius:8px; cursor:pointer; transition:all .12s; user-select:none; }
    .sensor-item:hover { border-color:var(--border2); }
    .sensor-item.active { border-color:var(--accentbdr); background:var(--accentbg); }
    .sensor-dot { width:6px; height:6px; border-radius:50%; background:var(--t3); flex-shrink:0; transition:background .12s; }
    .sensor-item.active .sensor-dot { background:var(--accent); }
    .alert-dot { background:rgba(248,113,113,0.5) !important; }
    .sensor-item.active .alert-dot { background:#f87171 !important; }
    .sensor-name { font-size:11px; color:var(--t2); flex:1; }
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
  `,e([ue({attribute:!1})],tt.prototype,"hass",void 0),e([ve()],tt.prototype,"_config",void 0),e([ve()],tt.prototype,"_tab",void 0),e([ve()],tt.prototype,"_openSections",void 0),e([ve()],tt.prototype,"_expandedRooms",void 0),e([ve()],tt.prototype,"_expandedDevices",void 0),e([ve()],tt.prototype,"_deviceSearch",void 0),e([ve()],tt.prototype,"_bgEditArea",void 0),e([ve()],tt.prototype,"_styleTab",void 0),e([ve()],tt.prototype,"_hiddenBlocks",void 0),e([ve()],tt.prototype,"_dragOrder",void 0),e([ve()],tt.prototype,"_dragOver",void 0),e([ve()],tt.prototype,"_styleClipFeedback",void 0),e([ve()],tt.prototype,"_copyAreaOpen",void 0),e([ve()],tt.prototype,"_copyJson",void 0),e([ve()],tt.prototype,"_pasteOpen",void 0),e([ve()],tt.prototype,"_pasteText",void 0),tt=e([pe("ha-device-dashboard-editor")],tt),window.customCards=window.customCards||[],window.customCards.push({type:"ha-device-dashboard",name:"HA Device Dashboard",description:"Universal device fleet overview — Shelly, ZHA, Hue, ESPHome, Matter and more.",preview:!0,documentationURL:"https://github.com/TheIcelandicguy/ha-device-dashboard"});
