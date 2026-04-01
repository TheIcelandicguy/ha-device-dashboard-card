function e(e,t,s,i){var r,a=arguments.length,o=a<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,s):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)o=Reflect.decorate(e,t,s,i);else for(var n=e.length-1;n>=0;n--)(r=e[n])&&(o=(a<3?r(o):a>3?r(t,s,o):r(t,s))||o);return a>3&&o&&Object.defineProperty(t,s,o),o}"function"==typeof SuppressedError&&SuppressedError;const t=globalThis,s=t.ShadowRoot&&(void 0===t.ShadyCSS||t.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,i=Symbol(),r=new WeakMap;let a=class{constructor(e,t,s){if(this._$cssResult$=!0,s!==i)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o;const t=this.t;if(s&&void 0===e){const s=void 0!==t&&1===t.length;s&&(e=r.get(t)),void 0===e&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),s&&r.set(t,e))}return e}toString(){return this.cssText}};const o=(e,...t)=>{const s=1===e.length?e[0]:t.reduce((t,s,i)=>t+(e=>{if(!0===e._$cssResult$)return e.cssText;if("number"==typeof e)return e;throw Error("Value passed to 'css' function must be a 'css' function result: "+e+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(s)+e[i+1],e[0]);return new a(s,e,i)},n=s?e=>e:e=>e instanceof CSSStyleSheet?(e=>{let t="";for(const s of e.cssRules)t+=s.cssText;return(e=>new a("string"==typeof e?e:e+"",void 0,i))(t)})(e):e,{is:l,defineProperty:c,getOwnPropertyDescriptor:d,getOwnPropertyNames:p,getOwnPropertySymbols:h,getPrototypeOf:g}=Object,u=globalThis,b=u.trustedTypes,v=b?b.emptyScript:"",m=u.reactiveElementPolyfillSupport,f=(e,t)=>e,_={toAttribute(e,t){switch(t){case Boolean:e=e?v:null;break;case Object:case Array:e=null==e?e:JSON.stringify(e)}return e},fromAttribute(e,t){let s=e;switch(t){case Boolean:s=null!==e;break;case Number:s=null===e?null:Number(e);break;case Object:case Array:try{s=JSON.parse(e)}catch(e){s=null}}return s}},y=(e,t)=>!l(e,t),x={attribute:!0,type:String,converter:_,reflect:!1,useDefault:!1,hasChanged:y};Symbol.metadata??=Symbol("metadata"),u.litPropertyMetadata??=new WeakMap;let $=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=x){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){const s=Symbol(),i=this.getPropertyDescriptor(e,s,t);void 0!==i&&c(this.prototype,e,i)}}static getPropertyDescriptor(e,t,s){const{get:i,set:r}=d(this.prototype,e)??{get(){return this[t]},set(e){this[t]=e}};return{get:i,set(t){const a=i?.call(this);r?.call(this,t),this.requestUpdate(e,a,s)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??x}static _$Ei(){if(this.hasOwnProperty(f("elementProperties")))return;const e=g(this);e.finalize(),void 0!==e.l&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(f("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(f("properties"))){const e=this.properties,t=[...p(e),...h(e)];for(const s of t)this.createProperty(s,e[s])}const e=this[Symbol.metadata];if(null!==e){const t=litPropertyMetadata.get(e);if(void 0!==t)for(const[e,s]of t)this.elementProperties.set(e,s)}this._$Eh=new Map;for(const[e,t]of this.elementProperties){const s=this._$Eu(e,t);void 0!==s&&this._$Eh.set(s,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){const t=[];if(Array.isArray(e)){const s=new Set(e.flat(1/0).reverse());for(const e of s)t.unshift(n(e))}else void 0!==e&&t.push(n(e));return t}static _$Eu(e,t){const s=t.attribute;return!1===s?void 0:"string"==typeof s?s:"string"==typeof e?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??=new Set).add(e),void 0!==this.renderRoot&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){const e=new Map,t=this.constructor.elementProperties;for(const s of t.keys())this.hasOwnProperty(s)&&(e.set(s,this[s]),delete this[s]);e.size>0&&(this._$Ep=e)}createRenderRoot(){const e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return((e,i)=>{if(s)e.adoptedStyleSheets=i.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet);else for(const s of i){const i=document.createElement("style"),r=t.litNonce;void 0!==r&&i.setAttribute("nonce",r),i.textContent=s.cssText,e.appendChild(i)}})(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,t,s){this._$AK(e,s)}_$ET(e,t){const s=this.constructor.elementProperties.get(e),i=this.constructor._$Eu(e,s);if(void 0!==i&&!0===s.reflect){const r=(void 0!==s.converter?.toAttribute?s.converter:_).toAttribute(t,s.type);this._$Em=e,null==r?this.removeAttribute(i):this.setAttribute(i,r),this._$Em=null}}_$AK(e,t){const s=this.constructor,i=s._$Eh.get(e);if(void 0!==i&&this._$Em!==i){const e=s.getPropertyOptions(i),r="function"==typeof e.converter?{fromAttribute:e.converter}:void 0!==e.converter?.fromAttribute?e.converter:_;this._$Em=i;const a=r.fromAttribute(t,e.type);this[i]=a??this._$Ej?.get(i)??a,this._$Em=null}}requestUpdate(e,t,s,i=!1,r){if(void 0!==e){const a=this.constructor;if(!1===i&&(r=this[e]),s??=a.getPropertyOptions(e),!((s.hasChanged??y)(r,t)||s.useDefault&&s.reflect&&r===this._$Ej?.get(e)&&!this.hasAttribute(a._$Eu(e,s))))return;this.C(e,t,s)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(e,t,{useDefault:s,reflect:i,wrapped:r},a){s&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,a??t??this[e]),!0!==r||void 0!==a)||(this._$AL.has(e)||(this.hasUpdated||s||(t=void 0),this._$AL.set(e,t)),!0===i&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}const e=this.scheduleUpdate();return null!=e&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[e,t]of this._$Ep)this[e]=t;this._$Ep=void 0}const e=this.constructor.elementProperties;if(e.size>0)for(const[t,s]of e){const{wrapped:e}=s,i=this[t];!0!==e||this._$AL.has(t)||void 0===i||this.C(t,void 0,s,i)}}let e=!1;const t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach(e=>e.hostUpdate?.()),this.update(t)):this._$EM()}catch(t){throw e=!1,this._$EM(),t}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach(e=>e.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach(e=>this._$ET(e,this[e])),this._$EM()}updated(e){}firstUpdated(e){}};$.elementStyles=[],$.shadowRootOptions={mode:"open"},$[f("elementProperties")]=new Map,$[f("finalized")]=new Map,m?.({ReactiveElement:$}),(u.reactiveElementVersions??=[]).push("2.1.2");const w=globalThis,k=e=>e,S=w.trustedTypes,A=S?S.createPolicy("lit-html",{createHTML:e=>e}):void 0,C="$lit$",E=`lit$${Math.random().toFixed(9).slice(2)}$`,P="?"+E,T=`<${P}>`,M=document,z=()=>M.createComment(""),O=e=>null===e||"object"!=typeof e&&"function"!=typeof e,R=Array.isArray,I="[ \t\n\f\r]",F=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,D=/-->/g,B=/>/g,N=RegExp(`>|${I}(?:([^\\s"'>=/]+)(${I}*=${I}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),j=/'/g,H=/"/g,U=/^(?:script|style|textarea|title)$/i,L=e=>(t,...s)=>({_$litType$:e,strings:t,values:s}),G=L(1),W=L(2),q=Symbol.for("lit-noChange"),V=Symbol.for("lit-nothing"),Y=new WeakMap,Z=M.createTreeWalker(M,129);function K(e,t){if(!R(e)||!e.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==A?A.createHTML(t):t}const X=(e,t)=>{const s=e.length-1,i=[];let r,a=2===t?"<svg>":3===t?"<math>":"",o=F;for(let t=0;t<s;t++){const s=e[t];let n,l,c=-1,d=0;for(;d<s.length&&(o.lastIndex=d,l=o.exec(s),null!==l);)d=o.lastIndex,o===F?"!--"===l[1]?o=D:void 0!==l[1]?o=B:void 0!==l[2]?(U.test(l[2])&&(r=RegExp("</"+l[2],"g")),o=N):void 0!==l[3]&&(o=N):o===N?">"===l[0]?(o=r??F,c=-1):void 0===l[1]?c=-2:(c=o.lastIndex-l[2].length,n=l[1],o=void 0===l[3]?N:'"'===l[3]?H:j):o===H||o===j?o=N:o===D||o===B?o=F:(o=N,r=void 0);const p=o===N&&e[t+1].startsWith("/>")?" ":"";a+=o===F?s+T:c>=0?(i.push(n),s.slice(0,c)+C+s.slice(c)+E+p):s+E+(-2===c?t:p)}return[K(e,a+(e[s]||"<?>")+(2===t?"</svg>":3===t?"</math>":"")),i]};class Q{constructor({strings:e,_$litType$:t},s){let i;this.parts=[];let r=0,a=0;const o=e.length-1,n=this.parts,[l,c]=X(e,t);if(this.el=Q.createElement(l,s),Z.currentNode=this.el.content,2===t||3===t){const e=this.el.content.firstChild;e.replaceWith(...e.childNodes)}for(;null!==(i=Z.nextNode())&&n.length<o;){if(1===i.nodeType){if(i.hasAttributes())for(const e of i.getAttributeNames())if(e.endsWith(C)){const t=c[a++],s=i.getAttribute(e).split(E),o=/([.?@])?(.*)/.exec(t);n.push({type:1,index:r,name:o[2],strings:s,ctor:"."===o[1]?ie:"?"===o[1]?re:"@"===o[1]?ae:se}),i.removeAttribute(e)}else e.startsWith(E)&&(n.push({type:6,index:r}),i.removeAttribute(e));if(U.test(i.tagName)){const e=i.textContent.split(E),t=e.length-1;if(t>0){i.textContent=S?S.emptyScript:"";for(let s=0;s<t;s++)i.append(e[s],z()),Z.nextNode(),n.push({type:2,index:++r});i.append(e[t],z())}}}else if(8===i.nodeType)if(i.data===P)n.push({type:2,index:r});else{let e=-1;for(;-1!==(e=i.data.indexOf(E,e+1));)n.push({type:7,index:r}),e+=E.length-1}r++}}static createElement(e,t){const s=M.createElement("template");return s.innerHTML=e,s}}function J(e,t,s=e,i){if(t===q)return t;let r=void 0!==i?s._$Co?.[i]:s._$Cl;const a=O(t)?void 0:t._$litDirective$;return r?.constructor!==a&&(r?._$AO?.(!1),void 0===a?r=void 0:(r=new a(e),r._$AT(e,s,i)),void 0!==i?(s._$Co??=[])[i]=r:s._$Cl=r),void 0!==r&&(t=J(e,r._$AS(e,t.values),r,i)),t}class ee{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){const{el:{content:t},parts:s}=this._$AD,i=(e?.creationScope??M).importNode(t,!0);Z.currentNode=i;let r=Z.nextNode(),a=0,o=0,n=s[0];for(;void 0!==n;){if(a===n.index){let t;2===n.type?t=new te(r,r.nextSibling,this,e):1===n.type?t=new n.ctor(r,n.name,n.strings,this,e):6===n.type&&(t=new oe(r,this,e)),this._$AV.push(t),n=s[++o]}a!==n?.index&&(r=Z.nextNode(),a++)}return Z.currentNode=M,i}p(e){let t=0;for(const s of this._$AV)void 0!==s&&(void 0!==s.strings?(s._$AI(e,s,t),t+=s.strings.length-2):s._$AI(e[t])),t++}}class te{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,s,i){this.type=2,this._$AH=V,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=s,this.options=i,this._$Cv=i?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode;const t=this._$AM;return void 0!==t&&11===e?.nodeType&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=J(this,e,t),O(e)?e===V||null==e||""===e?(this._$AH!==V&&this._$AR(),this._$AH=V):e!==this._$AH&&e!==q&&this._(e):void 0!==e._$litType$?this.$(e):void 0!==e.nodeType?this.T(e):(e=>R(e)||"function"==typeof e?.[Symbol.iterator])(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==V&&O(this._$AH)?this._$AA.nextSibling.data=e:this.T(M.createTextNode(e)),this._$AH=e}$(e){const{values:t,_$litType$:s}=e,i="number"==typeof s?this._$AC(e):(void 0===s.el&&(s.el=Q.createElement(K(s.h,s.h[0]),this.options)),s);if(this._$AH?._$AD===i)this._$AH.p(t);else{const e=new ee(i,this),s=e.u(this.options);e.p(t),this.T(s),this._$AH=e}}_$AC(e){let t=Y.get(e.strings);return void 0===t&&Y.set(e.strings,t=new Q(e)),t}k(e){R(this._$AH)||(this._$AH=[],this._$AR());const t=this._$AH;let s,i=0;for(const r of e)i===t.length?t.push(s=new te(this.O(z()),this.O(z()),this,this.options)):s=t[i],s._$AI(r),i++;i<t.length&&(this._$AR(s&&s._$AB.nextSibling,i),t.length=i)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e!==this._$AB;){const t=k(e).nextSibling;k(e).remove(),e=t}}setConnected(e){void 0===this._$AM&&(this._$Cv=e,this._$AP?.(e))}}class se{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,s,i,r){this.type=1,this._$AH=V,this._$AN=void 0,this.element=e,this.name=t,this._$AM=i,this.options=r,s.length>2||""!==s[0]||""!==s[1]?(this._$AH=Array(s.length-1).fill(new String),this.strings=s):this._$AH=V}_$AI(e,t=this,s,i){const r=this.strings;let a=!1;if(void 0===r)e=J(this,e,t,0),a=!O(e)||e!==this._$AH&&e!==q,a&&(this._$AH=e);else{const i=e;let o,n;for(e=r[0],o=0;o<r.length-1;o++)n=J(this,i[s+o],t,o),n===q&&(n=this._$AH[o]),a||=!O(n)||n!==this._$AH[o],n===V?e=V:e!==V&&(e+=(n??"")+r[o+1]),this._$AH[o]=n}a&&!i&&this.j(e)}j(e){e===V?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}}class ie extends se{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===V?void 0:e}}class re extends se{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==V)}}class ae extends se{constructor(e,t,s,i,r){super(e,t,s,i,r),this.type=5}_$AI(e,t=this){if((e=J(this,e,t,0)??V)===q)return;const s=this._$AH,i=e===V&&s!==V||e.capture!==s.capture||e.once!==s.once||e.passive!==s.passive,r=e!==V&&(s===V||i);i&&this.element.removeEventListener(this.name,this,s),r&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}}class oe{constructor(e,t,s){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=s}get _$AU(){return this._$AM._$AU}_$AI(e){J(this,e)}}const ne=w.litHtmlPolyfillSupport;ne?.(Q,te),(w.litHtmlVersions??=[]).push("3.3.2");const le=globalThis;let ce=class extends ${constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){const t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=((e,t,s)=>{const i=s?.renderBefore??t;let r=i._$litPart$;if(void 0===r){const e=s?.renderBefore??null;i._$litPart$=r=new te(t.insertBefore(z(),e),e,void 0,s??{})}return r._$AI(e),r})(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return q}};ce._$litElement$=!0,ce.finalized=!0,le.litElementHydrateSupport?.({LitElement:ce});const de=le.litElementPolyfillSupport;de?.({LitElement:ce}),(le.litElementVersions??=[]).push("4.2.2");const pe=e=>(t,s)=>{void 0!==s?s.addInitializer(()=>{customElements.define(e,t)}):customElements.define(e,t)},he={attribute:!0,type:String,converter:_,reflect:!1,hasChanged:y},ge=(e=he,t,s)=>{const{kind:i,metadata:r}=s;let a=globalThis.litPropertyMetadata.get(r);if(void 0===a&&globalThis.litPropertyMetadata.set(r,a=new Map),"setter"===i&&((e=Object.create(e)).wrapped=!0),a.set(s.name,e),"accessor"===i){const{name:i}=s;return{set(s){const r=t.get.call(this);t.set.call(this,s),this.requestUpdate(i,r,e,!0,s)},init(t){return void 0!==t&&this.C(i,void 0,e,t),t}}}if("setter"===i){const{name:i}=s;return function(s){const r=this[i];t.call(this,s),this.requestUpdate(i,r,e,!0,s)}}throw Error("Unsupported decorator location: "+i)};function ue(e){return(t,s)=>"object"==typeof s?ge(e,t,s):((e,t,s)=>{const i=t.hasOwnProperty(s);return t.constructor.createProperty(s,e),i?Object.getOwnPropertyDescriptor(t,s):void 0})(e,t,s)}function be(e){return ue({...e,state:!0,attribute:!1})}const ve=1;let me=class{constructor(e){}get _$AU(){return this._$AM._$AU}_$AT(e,t,s){this._$Ct=e,this._$AM=t,this._$Ci=s}_$AS(e,t){return this.update(e,t)}update(e,t){return this.render(...t)}};const fe="important",_e=" !"+fe,ye=(e=>(...t)=>({_$litDirective$:e,values:t}))(class extends me{constructor(e){if(super(e),e.type!==ve||"style"!==e.name||e.strings?.length>2)throw Error("The `styleMap` directive must be used in the `style` attribute and must be the only part in the attribute.")}render(e){return Object.keys(e).reduce((t,s)=>{const i=e[s];return null==i?t:t+`${s=s.includes("-")?s:s.replace(/(?:^(webkit|moz|ms|o)|)(?=[A-Z])/g,"-$&").toLowerCase()}:${i};`},"")}update(e,[t]){const{style:s}=e.element;if(void 0===this.ft)return this.ft=new Set(Object.keys(t)),this.render(t);for(const e of this.ft)null==t[e]&&(this.ft.delete(e),e.includes("-")?s.removeProperty(e):s[e]=null);for(const e in t){const i=t[e];if(null!=i){this.ft.add(e);const t="string"==typeof i&&i.endsWith(_e);e.includes("-")||t?s.setProperty(e,t?i.slice(0,-11):i,t?fe:""):s[e]=i}}return q}}),xe=new Set(["switch","light","cover","valve","climate","sensor","binary_sensor","fan","lock","media_player","vacuum","alarm_control_panel","humidifier","water_heater","update","button","number","select","text","camera","event"]),$e=new Set(["script","scene","automation","input_boolean","input_number","input_text","input_select","input_datetime","input_button","timer","counter"]);function we(e,t){const s=e.entities??{},i=e.devices??{},r=e.areas??{},a=t&&t.length>0?new Set(t.map(e=>e.toLowerCase())):null,o=new Map;for(const t of Object.values(e.states)){const e=t.entity_id.split(".")[0];if(!xe.has(e))continue;const n=s[t.entity_id];if(!n?.device_id)continue;if(n.hidden_by)continue;const l=(n.platform??"").toLowerCase();if(a&&!a.has(l))continue;const c=n.device_id;if(!o.has(c)){const e=i[c];if(!e)continue;const t=(e.configuration_url??"").match(/https?:\/\/((?:\d{1,3}\.){3}\d{1,3})/),s=(e.manufacturer??"").toLowerCase().includes("shelly")||"shelly"===l,a=e.area_id??n.area_id,d=a?r[a]?.name:void 0;o.set(c,{device_id:c,name:e.name_by_user??e.name??c,area:d,model:e.model,sw_version:e.sw_version,ip:t?t[1]:void 0,isShelly:s,integration:l,entities:[]})}const d=o.get(c);d.isShelly||"shelly"!==l||(d.isShelly=!0,d.integration="shelly"),d.entities.push({entity_id:t.entity_id,domain:e,state:t.state,attributes:t.attributes,device_id:c,area_id:n.area_id,platform:l})}return Array.from(o.values()).filter(e=>e.entities.length>0).sort((e,t)=>e.name.localeCompare(t.name))}function ke(e,t){const s=e.devices??{},i=e.entities??{},r=e.areas??{},a=s[t];if(!a)return null;const o=(a.configuration_url??"").match(/https?:\/\/((?:\d{1,3}\.){3}\d{1,3})/),n=(a.manufacturer??"").toLowerCase(),l=a.area_id,c=l?r[l]?.name:void 0,d={device_id:t,name:a.name_by_user??a.name??t,area:c,model:a.model,sw_version:a.sw_version,ip:o?o[1]:void 0,isShelly:n.includes("shelly"),integration:"",entities:[]};for(const s of Object.values(e.states)){const e=i[s.entity_id];if(e?.device_id!==t)continue;if(e?.hidden_by)continue;const r=s.entity_id.split(".")[0],a=(e.platform??"").toLowerCase();d.isShelly||"shelly"!==a||(d.isShelly=!0,d.integration="shelly"),d.entities.push({entity_id:s.entity_id,domain:r,state:s.state,attributes:s.attributes,device_id:t,platform:a})}return 0===d.entities.length?null:(!d.integration&&d.entities[0]&&(d.integration=d.entities[0].platform??""),d)}const Se={relay:"Relay",plug:"Plug",switch:"Switch",dimmer:"Dimmer",rgb:"RGB",light:"Light",climate:"TRV",cover:"Roller",fan:"Fan",lock:"Lock",vacuum:"Vacuum",media_player:"Media",alarm:"Alarm",humidifier:"Humid.",valve:"Valve",energy:"Energy",sensor:"Sensor",input:"Input",camera:"Camera",uni:"UNI",wall_display:"Display",script:"Script",scene:"Scene",automation:"Auto",helper:"Helper",weather:"Weather",person:"Person",generic:""},Ae={relay:["name_row","sensors","graph","power_bar","badges"],plug:["name_row","sensors","graph","power_bar","badges"],switch:["name_row","sensors","badges"],dimmer:["name_row","dimmer","sensors","graph","badges"],rgb:["name_row","dimmer","sensors","graph","badges"],light:["name_row","dimmer","sensors","badges"],climate:["name_row","trv_control","sensors","badges"],cover:["name_row","cover_controls","sensors","badges"],fan:["name_row","fan_controls","sensors","badges"],lock:["name_row","sensors","badges"],vacuum:["name_row","sensors","badges"],media_player:["name_row","media_controls","badges"],alarm:["name_row","sensors","badges"],humidifier:["name_row","sensors","badges"],valve:["name_row","valve_controls","sensors","badges"],energy:["name_row","sensors","graph","badges"],sensor:["name_row","sensors","graph","badges"],input:["name_row","input_channels","badges"],camera:["name_row","badges"],uni:["name_row","input_channels","sensors","badges"],wall_display:["name_row","trv_control","sensors","badges"],script:["name_row"],scene:["name_row"],automation:["name_row","sensors"],helper:["name_row"],weather:["name_row","sensors"],person:["name_row","sensors"],generic:["name_row","sensors","badges"]};const Ce={shelly:"Shelly",zha:"ZHA",mqtt:"MQTT",z2m:"Z2M",zigbee2mqtt:"Z2M",hue:"Hue",deconz:"deCONZ",matter:"Matter",homekit:"HomeKit",tuya:"Tuya",tplink:"Kasa",esphome:"ESPHome",wled:"WLED",tasmota:"Tasmota",konnected:"Konnected",nest:"Nest",ring:"Ring",lifx:"LIFX",nanoleaf:"Nanoleaf",sonos:"Sonos"};function Ee(e){return e>=1e3?`${(e/1e3).toFixed(2)} kW`:`${e.toFixed(1)} W`}function Pe(e){return`${e.toFixed(3)} kWh`}function Te(e){return`${e.toFixed(1)} V`}function Me(e){return`${e.toFixed(3)} A`}function ze(e){return`${e.toFixed(1)} °C`}function Oe(e){return e<60?`${e}s`:e<3600?`${Math.floor(e/60)}m`:e<86400?`${Math.floor(e/3600)}h ${Math.floor(e%3600/60)}m`:`${Math.floor(e/86400)}d ${Math.floor(e%86400/3600)}h`}function Re(e){return e>=-50?"Excellent":e>=-60?"Good":e>=-70?"Fair":"Poor"}function Ie(e){return`${e.toFixed(1)} VA`}function Fe(e){return`${e.toFixed(1)} VAr`}function De(e){return`${e.toFixed(2)} Hz`}function Be(e){return`${e.toFixed(1)} %`}function Ne(e){return e>=1e4?`${(e/1e3).toFixed(1)} klx`:`${Math.round(e)} lx`}function je(e){return`${Math.round(e)} ppm`}function He(e){return`${Math.round(e)} %`}const Ue=[{key:"power",label:"Power",unit:"W",group:"Electrical",defaultColor:"#f4601e"},{key:"voltage",label:"Voltage",unit:"V",group:"Electrical",defaultColor:"#a78bfa"},{key:"current",label:"Current",unit:"A",group:"Electrical",defaultColor:"#fbbf24"},{key:"energy",label:"Energy",unit:"kWh",group:"Electrical",defaultColor:"#4ade80"},{key:"apparent_power",label:"App. Power",unit:"VA",group:"Electrical",defaultColor:"#f472b6"},{key:"reactive_power",label:"React. Power",unit:"VAr",group:"Electrical",defaultColor:"#818cf8"},{key:"frequency",label:"Frequency",unit:"Hz",group:"Electrical",defaultColor:"#34d399"},{key:"power_factor",label:"Power Factor",unit:"%",group:"Electrical",defaultColor:"#fb923c"},{key:"temperature",label:"Temperature",unit:"°C",group:"Environmental",defaultColor:"#4fc3f7"},{key:"humidity",label:"Humidity",unit:"%",group:"Environmental",defaultColor:"#2dd4bf"},{key:"illuminance",label:"Illuminance",unit:"lx",group:"Environmental",defaultColor:"#fde047"},{key:"carbon_dioxide",label:"CO₂",unit:"ppm",group:"Environmental",defaultColor:"#a3e635"},{key:"gas",label:"Gas",unit:"%",group:"Environmental",defaultColor:"#fb923c"},{key:"battery",label:"Battery",unit:"%",group:"Device",defaultColor:"#86efac"},{key:"signal_strength",label:"RSSI",unit:"dBm",group:"Device",defaultColor:"#7dd3fc"}],Le=Object.fromEntries(Ue.map(e=>[e.key,e.label.split(" ")[0]]));var Ge;let We=Ge=class extends ce{constructor(){super(...arguments),this._expandedDevice=null,this._closedAreas=new Set,this._entityListOpen=new Set,this._graphData=new Map,this._graphFetching=new Set,this._graphFetchedAt=new Map}static getConfigElement(){return document.createElement("ha-device-dashboard-editor")}static getStubConfig(){return{type:"custom:ha-device-dashboard"}}static getLayoutOptions(){return{grid_columns:10,grid_min_columns:4,grid_min_rows:3}}setConfig(e){this._config=e}getCardSize(){return 6}disconnectedCallback(){super.disconnectedCallback(),this._graphFetching.clear(),this._graphFetchedAt.clear(),this._graphData=new Map}_getDevices(){if(!this.hass)return[];let e=we(this.hass,this._config.integrations);if(void 0!==this._config.areas){const t=new Set((this._config.areas??[]).map(e=>e.toLowerCase()));e=e.filter(e=>t.has((e.area??"").toLowerCase()))}if(!1===this._config.show_offline&&(e=e.filter(e=>this._isOnline(e))),this._config.hide_shelly&&(e=e.filter(e=>!e.isShelly)),this._config.hidden_devices?.length){const t=new Set(this._config.hidden_devices);e=e.filter(e=>!t.has(e.device_id))}if(this._config.include_entities){const t=function(e,t){const s=e.entities??{},i=e.areas??{},r=t&&t.length>0?new Set(t.map(e=>e.replace(".*",""))):$e,a=[];for(const t of Object.values(e.states)){const e=t.entity_id.split(".")[0];if(!r.has(e))continue;const o=s[t.entity_id];if(o?.device_id)continue;if(o?.hidden_by)continue;const n=o?.area_id,l=n?i[n]?.name:void 0,c=t.attributes?.friendly_name??t.entity_id.split(".")[1].replace(/_/g," ");a.push({device_id:t.entity_id,name:c,area:l,isShelly:!1,integration:e,isVirtual:!0,entities:[{entity_id:t.entity_id,domain:e,state:t.state,attributes:t.attributes,platform:e}]})}return a.sort((e,t)=>e.name.localeCompare(t.name))}(this.hass,this._config.entity_domains);e=[...e,...t]}if(this._config.extra_devices?.length){const t=new Set(e.map(e=>e.device_id));for(const s of this._config.extra_devices){if(t.has(s))continue;const i=ke(this.hass,s);i&&e.push(i)}}return e}_groupByArea(e){const t=new Map;for(const s of e){const e=s.area??"";t.has(e)||t.set(e,[]),t.get(e).push(s)}const s=this._config.sort_by??"name";return new Map([...t.entries()].sort(([e],[t])=>e?t?e.localeCompare(t):-1:1).map(([e,t])=>[e,t.sort("power"===s?(e,t)=>(this._getPower(t)??-1)-(this._getPower(e)??-1):"online"===s?(e,t)=>Number(this._isOnline(t))-Number(this._isOnline(e))||e.name.localeCompare(t.name):(e,t)=>e.name.localeCompare(t.name))]))}_isOnline(e){return e.entities.some(e=>{const t=this.hass.states[e.entity_id];return t&&"unavailable"!==t.state&&"unknown"!==t.state})}_getPower(e){let t=0,s=!1;for(const i of e.entities){const e=this.hass.states[i.entity_id];if(!e)continue;const r=e.attributes;if(null!=r.current_power_w){const e=Number(r.current_power_w);isNaN(e)||(t+=e,s=!0);continue}if("sensor"===i.domain&&"power"===r.device_class){const i=parseFloat(e.state);isNaN(i)||(t+=i,s=!0)}}return s?t:null}_getPrimarySwitch(e){for(const t of e.entities){if("switch"!==t.domain&&"light"!==t.domain)continue;const e=this.hass.states[t.entity_id];if(!e)continue;const s=e.attributes;let i,r,a,o;if("light"===t.domain){i="on"===e.state&&null!=s.brightness?Math.round(s.brightness/Ge.BRIGHTNESS_MAX*100):0;const t=s.supported_color_modes??[];if(t.some(e=>["rgb","rgbw","rgbww","hs","xy"].includes(e))&&(r=t),s.rgbw_color){const[e,t,i,r]=s.rgbw_color;a=[e,t,i],o=r}else s.rgb_color&&(a=s.rgb_color)}return{entityId:t.entity_id,isOn:"on"===e.state,brightness:i,colorModes:r,rgbColor:a,whiteValue:o}}return null}_getTrv(e){const t=e.entities.find(e=>"climate"===e.domain);if(!t)return null;const s=this.hass.states[t.entity_id];if(!s)return null;const i=s.attributes;let r=i.current_valve_position??i.valve_position;if(null==r){const t=e.entities.find(e=>"sensor"===e.domain&&e.entity_id.includes("valve"));if(t){const e=parseFloat(this.hass.states[t.entity_id]?.state??"");isNaN(e)||(r=e)}}return{entityId:t.entity_id,currentTemp:i.current_temperature,targetTemp:i.temperature,minTemp:i.min_temp??4,maxTemp:i.max_temp??30,step:i.target_temp_step??.5,hvacMode:s.state,hvacAction:i.hvac_action??s.state,presetMode:i.preset_mode,presetModes:(i.preset_modes??[]).filter(e=>"none"!==e),valvePosition:r}}_getCover(e){const t=e.entities.find(e=>"cover"===e.domain);if(!t)return null;const s=this.hass.states[t.entity_id];return s?{entityId:t.entity_id,state:s.state,position:s.attributes?.current_position}:null}_getValve(e){const t=e.entities.find(e=>"valve"===e.domain);if(!t)return null;const s=this.hass.states[t.entity_id];if(!s)return null;let i,r=s.attributes?.current_position;if(null==r){const t=e.entities.find(e=>"sensor"===e.domain&&e.entity_id.includes("position"));if(t){const e=parseFloat(this.hass.states[t.entity_id]?.state??"");isNaN(e)||(r=e)}}const a=e.entities.find(e=>"sensor"===e.domain&&"temperature"===this.hass.states[e.entity_id]?.attributes?.device_class);if(a){const e=parseFloat(this.hass.states[a.entity_id]?.state??"");isNaN(e)||(i=e)}return{entityId:t.entity_id,state:s.state,position:r,temperature:i}}_getFan(e){const t=e.entities.find(e=>"fan"===e.domain);if(!t)return null;const s=this.hass.states[t.entity_id];if(!s)return null;const i=s.attributes;return{entityId:t.entity_id,isOn:"on"===s.state,percentage:i.percentage,percentageStep:i.percentage_step??10,oscillating:i.oscillating,presetMode:i.preset_mode,presetModes:i.preset_modes??[]}}_getMedia(e){const t=e.entities.find(e=>"media_player"===e.domain);if(!t)return null;const s=this.hass.states[t.entity_id];if(!s)return null;const i=s.attributes;return{entityId:t.entity_id,state:s.state,isPlaying:"playing"===s.state,volume:i.volume_level,isMuted:i.is_volume_muted,title:i.media_title,artist:i.media_artist}}async _setValvePosition(e,t){await this.hass.callService("valve","set_valve_position",{entity_id:e,position:Math.round(Math.max(0,Math.min(100,t)))})}_getAlerts(e){const t=[];for(const s of e.entities){if("binary_sensor"!==s.domain)continue;const e=this.hass.states[s.entity_id];if(!e||"on"!==e.state)continue;const i=e.attributes.device_class??"";"heat"===i||s.entity_id.includes("overtemp")?t.push("overtemp"):("safety"===i||s.entity_id.includes("overpower"))&&t.push("overpower")}return t}_getFirmware(e){for(const t of e.entities){if("update"!==t.domain)continue;const e=this.hass.states[t.entity_id];if(!e||"on"!==e.state)continue;const s=e.attributes;return{entityId:t.entity_id,current:s.installed_version??"",newVersion:s.latest_version}}return null}_getSensors(e){const t=this._config.sensors?.length?new Set(this._config.sensors):null,s=e=>!t||t.has(e),i=[],r=new Set,a=(e,t,s,a=!1)=>{r.has(e)||(r.add(e),i.push({label:t,value:s,warn:a}))};for(const t of e.entities){const e=this.hass.states[t.entity_id];if(!e||"unavailable"===e.state||"unknown"===e.state)continue;const i=e.attributes.device_class??"",r=t.entity_id;if("sensor"===t.domain){if(!i&&(r.endsWith("_ip")||r.endsWith("_ip_address"))&&s("ip")){a("ip","IP",e.state);continue}if(!i&&r.endsWith("_ssid")&&s("ssid")){a("ssid","SSID",e.state);continue}if(!i&&(r.endsWith("_firmware")||r.endsWith("_fw"))&&s("fw_version")){a("fw_version","FW",e.state);continue}if(!i&&r.endsWith("_mac")&&s("mac")){a("mac","MAC",e.state);continue}const t=parseFloat(e.state);if(isNaN(t))continue;"power"===i&&s("power")?a("power","Power",Ee(t)):"apparent_power"===i&&s("apparent_power")?a("apparent_power","App.P",Ie(t)):"reactive_power"===i&&s("reactive_power")?a("reactive_power","Re.P",Fe(t)):"power_factor"===i&&s("power_factor")?a("power_factor","PF",He(t)):"frequency"===i&&s("frequency")?a("frequency","Freq",De(t)):"energy"===i&&s("energy")?a("energy","Energy",Pe(t)):"voltage"===i&&s("voltage")?a("voltage","Volt",Te(t)):"current"===i&&s("current")?a("current","Curr",Me(t)):"temperature"===i&&s("temperature")?a("temperature","Temp",ze(t)):"humidity"===i&&s("humidity")?a("humidity","Hum",Be(t)):"illuminance"===i&&s("illuminance")?a("illuminance","Light",Ne(t)):"carbon_dioxide"===i&&s("co2")?a("co2","CO₂",je(t)):"gas"===i&&s("gas")?a("gas","Gas",`${t.toFixed(1)} %`):"battery"===i&&s("battery")?a("battery","Batt",He(t)):("signal_strength"===i||r.includes("rssi"))&&s("rssi")?a("rssi","Wi-Fi",`${Re(t)} (${t} dBm)`):r.includes("uptime")&&s("uptime")&&a("uptime","Uptime",Oe(t))}else if("binary_sensor"===t.domain){const t="on"===e.state;"motion"===i&&s("motion")?a("motion","Motion",t?"Motion":"Clear"):"door"!==i&&"window"!==i&&"opening"!==i||!s("door")?"moisture"===i&&s("flood")?a("flood","Flood",t?"Flooded":"Dry",t):"smoke"===i&&s("smoke")?a("smoke","Smoke",t?"Smoke!":"Clear",t):"gas"===i&&s("gas")?a("gas","Gas",t?"Gas!":"Clear",t):"vibration"===i&&s("vibration")?a("vibration","Vibr",t?"Vibrating":"Clear"):("heat"===i||r.includes("overtemp"))&&s("overtemp")?a("overtemp","Overtemp",t?"Overtemp!":"OK",t):("safety"===i||r.includes("overpower"))&&s("overpower")?a("overpower","Overpower",t?"Overpower!":"OK",t):"connectivity"===i&&r.includes("cloud")&&s("cloud")?a("cloud","Cloud",t?"Connected":"Offline",!t):"connectivity"===i&&r.includes("mqtt")&&s("mqtt")?a("mqtt","MQTT",t?"Connected":"Offline",!t):"connectivity"===i&&r.includes("eth")&&s("eth")&&a("eth","Ethernet",t?"Connected":"Offline",!t):a("door","Door",t?"Open":"Closed")}}return i}_getInputChannels(e){return e.entities.filter(e=>"binary_sensor"===e.domain&&(e.entity_id.includes("input")||e.entity_id.includes("button")||null==e.attributes?.device_class)).map(e=>{const t=this.hass.states[e.entity_id],s=t?.attributes?.friendly_name??"",i=e.entity_id.match(/(?:input|channel|button)[_\s]*(\d+)/i)??s.match(/(\d+)\s*$/),r=i?parseInt(i[1]):0;return{entityId:e.entity_id,label:i?`${r}`:"?",fullName:s||e.entity_id,isOn:"on"===t?.state,channel:r}}).sort((e,t)=>e.channel-t.channel)}async _toggle(e,t,s){s.stopPropagation();const i=e.split(".")[0];await this.hass.callService(i,t?"turn_off":"turn_on",{entity_id:e})}async _setBrightness(e,t){await this.hass.callService("light","turn_on",{entity_id:e,brightness_pct:Math.max(1,Math.min(100,t))})}_rgbToHex(e,t,s){return"#"+[e,t,s].map(e=>e.toString(16).padStart(2,"0")).join("")}_hexToRgb(e){return[parseInt(e.slice(1,3),16),parseInt(e.slice(3,5),16),parseInt(e.slice(5,7),16)]}async _setColor(e,t,s,i=!1){const r=this._hexToRgb(t);i&&void 0!==s?await this.hass.callService("light","turn_on",{entity_id:e,rgbw_color:[...r,s]}):await this.hass.callService("light","turn_on",{entity_id:e,rgb_color:r})}async _coverAction(e,t,s){s.stopPropagation();await this.hass.callService("cover",{open:"open_cover",close:"close_cover",stop:"stop_cover"}[t],{entity_id:e})}async _setCoverPosition(e,t){await this.hass.callService("cover","set_cover_position",{entity_id:e,position:Math.round(Math.max(0,Math.min(100,t)))})}async _valveAction(e,t,s){s.stopPropagation();await this.hass.callService("valve",{open:"open_valve",close:"close_valve",stop:"stop_valve"}[t],{entity_id:e})}async _setTemp(e,t){await this.hass.callService("climate","set_temperature",{entity_id:e,temperature:Math.round(2*t)/2})}async _setHvacMode(e,t,s){s.stopPropagation(),await this.hass.callService("climate","set_hvac_mode",{entity_id:e,hvac_mode:t})}async _installUpdate(e,t){t.stopPropagation(),await this.hass.callService("update","install",{entity_id:e})}_getGraphEntities(e){const t=this._config.graph_sensors;let s;if(void 0!==t)s=t;else{const t=new Set(Ue.map(e=>e.key)),i=new Set;for(const s of e.entities){if("sensor"!==s.domain)continue;const e=this.hass.states[s.entity_id]?.attributes?.device_class;e&&t.has(e)&&i.add(e),s.entity_id.includes("rssi")&&i.add("signal_strength")}s=Ue.map(e=>e.key).filter(e=>i.has(e))}if(!s.length)return[];const i=[];for(const t of s){const s=e.entities.find(e=>{if("sensor"!==e.domain)return!1;return(this.hass.states[e.entity_id]?.attributes?.device_class??e.attributes?.device_class)===t||"signal_strength"===t&&e.entity_id.includes("rssi")});if(s){const e=this.hass.states[s.entity_id]?.attributes?.unit_of_measurement??"";i.push({entityId:s.entity_id,label:Le[t]??t,dc:t,unit:e})}}return i}_requestGraphData(e){if(this._graphFetching.has(e))return;Date.now()-(this._graphFetchedAt.get(e)??0)<3e5&&this._graphData.has(e)||this._fetchGraphData(e)}_retryGraphData(e){if(this._graphFetching.has(e))return;this._graphFetchedAt.delete(e);const t=new Map(this._graphData);t.delete(e),this._graphData=t,this._fetchGraphData(e)}_refreshAllGraphs(e){const t=this._getGraphEntities(e).map(e=>e.entityId).filter(e=>!this._graphFetching.has(e));t.forEach(e=>this._graphFetchedAt.delete(e));const s=new Map(this._graphData);t.forEach(e=>s.delete(e)),this._graphData=s,t.forEach(e=>this._fetchGraphData(e))}async _fetchGraphData(e){this._graphFetching.add(e);try{const t=this._config.graph_hours??24,s=`history/period/${new Date(Date.now()-36e5*t).toISOString()}?filter_entity_id=${e}&minimal_response=true&no_attributes=true`,i=await this.hass.callApi("GET",s);let r=(i?.[0]??[]).map(e=>({t:new Date(e.last_changed).getTime(),v:parseFloat(e.state)})).filter(e=>!isNaN(e.v));if(1===r.length){const t=parseFloat(this.hass.states[e]?.state??"");r.push({t:Date.now(),v:isNaN(t)?r[0].v:t})}const a=new Map(this._graphData);a.set(e,r),this._graphData=a}catch(t){console.warn("[ha-device-dashboard] history fetch failed",e,t)}finally{this._graphFetchedAt.set(e,Date.now()),this._graphFetching.delete(e)}}_renderSparklines(e,t=!1){const s=this._getGraphEntities(e);if(!s.length)return G``;const i=this._config.graph_style??{},r=200,a=i.height??32,o=null!=i.height,n=i.line_width??1.5,l=!1!==i.fill,c=!1!==i.show_dots,d=!1!==i.tick_lines,p=!1!==i.time_labels,h=i.type??"line",g=this._config.graph_hours??24,u=g<=1?6e4:g<=5?12e4:3e5,b=this._config.graph_sensor_colors??{},v=this._config.graph_line_color,m=e=>new Date(e).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}),f=s.map(({entityId:e,label:s,unit:i,dc:g})=>{const f=b[g]??v??Ue.find(e=>e.key===g)?.defaultColor??"#f4601e";this._requestGraphData(e);const _=this._graphData.get(e);if(!_)return G`
          <div class="spark-row">
            <span class="spark-lbl">${s}</span>
            <div class="sparkline-loading" style="height:${o?t?Math.round(1.5*a):a:t?48:32}px"></div>
            <span class="spark-val">—</span>
          </div>`;if(_.length<2)return G`
          <div class="spark-row">
            <span class="spark-lbl">${s}</span>
            <span class="spark-no-data">no history</span>
            <button class="spark-retry" @click=${t=>{t.stopPropagation(),this._retryGraphData(e)}}>↺</button>
          </div>`;const y=_.map(e=>e.v),x=Math.min(...y),$=Math.max(...y),w=$-x||1,k=_[0].t,S=_[_.length-1].t,A=S-k||1,C=e=>(e.t-k)/A*r,E=e=>a-4-(e.v-x)/w*(a-8),P=_.map(e=>`${C(e).toFixed(1)},${E(e).toFixed(1)}`).join(" "),T=C(_[0]).toFixed(1),M=`sg-${e.replace(/[^a-z0-9]/gi,"")}`,z=y[y.length-1],O=z%1==0?`${z}`:z.toFixed(1),R=y.indexOf($),I=y.indexOf(x),F=C(_[R]).toFixed(1),D=E(_[R]).toFixed(1),B=C(_[I]).toFixed(1),N=E(_[I]).toFixed(1),j=m(_[0].t),H=m((_[0].t+S)/2),U=u/A*r,L=`${Math.max(.3,.7*U).toFixed(2)} ${Math.max(.3,.3*U).toFixed(2)}`,q=c&&$-x>0;return G`
        <div class="spark-group">
          <div class="spark-row">
            <span class="spark-lbl">${s}</span>
            <div class="spark-svg-wrap">
              <svg viewBox="0 0 ${r} ${a}" preserveAspectRatio="none"
                class="sparkline-svg ${t?"exp":""}"
                style="height:${o?t?Math.round(1.5*a):a:t?48:32}px"
                @mousemove=${e=>{const t=e.currentTarget,s=t.getBoundingClientRect(),a=Math.max(0,Math.min(1,(e.clientX-s.left)/s.width)),o=k+a*A;let n=_[0];for(const e of _)Math.abs(e.t-o)<Math.abs(n.t-o)&&(n=e);const l=C(n),c=E(n),d=t.querySelector(".spark-crosshair");d&&(d.setAttribute("x1",String(l)),d.setAttribute("x2",String(l)),d.style.display="");const p=t.querySelector(".spark-hover-dot");p&&(p.setAttribute("cx",String(l)),p.setAttribute("cy",String(c)),p.style.display="");const h=t.parentElement,g=h?.querySelector(".spark-tooltip");if(g){const e=g.querySelector(".spark-tooltip-val"),t=g.querySelector(".spark-tooltip-time");e&&(e.textContent=`${n.v%1==0?String(n.v):n.v.toFixed(1)} ${i}`),t&&(t.textContent=m(n.t)),g.style.left=`${(l/r*100).toFixed(1)}%`,g.style.display=""}}} @mouseleave=${e=>{const t=e.currentTarget;t.querySelector(".spark-crosshair")?.style&&(t.querySelector(".spark-crosshair").style.display="none"),t.querySelector(".spark-hover-dot")?.style&&(t.querySelector(".spark-hover-dot").style.display="none");const s=t.parentElement?.querySelector(".spark-tooltip");s&&(s.style.display="none")}}>
                <defs>
                  <linearGradient id="${M}" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="${f}" stop-opacity="0.3"/>
                    <stop offset="100%" stop-color="${f}" stop-opacity="0"/>
                  </linearGradient>
                </defs>
                ${d?W`
                  <line x1="0"        x2="0"        y1="0" y2="${a}" class="spark-tick"/>
                  <line x1="${100}" x2="${100}" y1="0" y2="${a}" class="spark-tick"/>
                  <line x1="${r}"     x2="${r}"     y1="0" y2="${a}" class="spark-tick"/>
                `:V}
                ${"bar"!==h&&l?W`
                  <polygon points="${P} ${r},${a-4} ${T},${a-4}" fill="url(#${M})"/>
                `:V}
                ${"bar"===h?_.map(e=>{const t=Math.max(2,r/_.length-2),s=C(e)-t/2,i=E(e),o=a-4-i;return W`<rect x="${s.toFixed(1)}" y="${i.toFixed(1)}" width="${t.toFixed(1)}" height="${Math.max(0,o).toFixed(1)}" rx="1.5" fill="${f}" opacity="0.75"/>`}):W`
                    <polyline points="${P}" fill="none"
                      stroke="${f}" stroke-width="${n}"
                      vector-effect="non-scaling-stroke"
                      stroke-linecap="round" stroke-linejoin="round"/>
                  `}
                <line x1="0" y1="${a}" x2="${r}" y2="${a}"
                  stroke="rgba(255,255,255,0.5)" stroke-width="0.8"
                  stroke-dasharray="${L}" pointer-events="none"
                  vector-effect="non-scaling-stroke"/>
                ${q?W`
                  <circle cx="${F}" cy="${D}" r="3"
                    fill="${f}" stroke="#1e1e2e" stroke-width="1.2"/>
                  <circle cx="${B}" cy="${N}" r="2.5"
                    fill="#6b7280" stroke="#1e1e2e" stroke-width="1.2"/>
                  ${t?W`
                    <text x="${F}" y="${String(parseFloat(D)-5)}" text-anchor="middle" font-size="8" fill="${f}" opacity="0.9">${$%1==0?$:$.toFixed(1)}</text>
                    <text x="${B}" y="${String(parseFloat(N)+10)}" text-anchor="middle" font-size="8" fill="#6b7280" opacity="0.8">${x%1==0?x:x.toFixed(1)}</text>
                  `:V}
                `:V}
                <line class="spark-crosshair" x1="0" x2="0" y1="0" y2="${a}" style="display:none"/>
                <circle class="spark-hover-dot" cx="0" cy="0" r="3.5" style="display:none"/>
              </svg>
              <div class="spark-tooltip" style="display:none">
                <span class="spark-tooltip-val"></span>
                <span class="spark-tooltip-time"></span>
              </div>
            </div>
            <span class="spark-val">${O} ${i}</span>
          </div>
          ${p?G`
            <div class="spark-time-row ${t?"exp":""}">
              <div class="spark-time-spacer"></div>
              <div class="spark-time-labels">
                <span>${j}</span><span>${H}</span><span>now</span>
              </div>
              <div class="spark-time-end"></div>
            </div>
          `:V}
        </div>`});return G`
      <div class="sparklines-block ${t?"exp":""}"
        @click=${t?e=>e.stopPropagation():V}>
        ${f}
      </div>`}_getBlockOrder(e,t){const s=this._config.device_styles?.[e.device_id]?.tile_layout;return s||(this._config.tile_layout?this._config.tile_layout:Ae[t.type]??Ae.generic)}_renderBlock(e,t,s,i){const r=this._getPrimarySwitch(t),a=this._getTrv(t),o=this._getCover(t);this._getValve(t);const n=this._getAlerts(t),l=this._isOnline(t),c=this._getFirmware(t),d=this._getPower(t),p=this._getSensors(t),h=this._getInputChannels(t),g=r?.isOn??!1,u=void 0!==r?.brightness,b=u&&g?Math.max(1,r.brightness??1):0,v=!!r?.colorModes?.length,m=v&&r.rgbColor?this._rgbToHex(...r.rgbColor):"#ffffff",f=v&&(r.colorModes?.some(e=>"rgbw"===e||"rgbww"===e)??!1),_="heat"===a?.hvacMode,y="ble"===s.gen?"BLE":"other"===s.gen?"":`G${s.gen}`,x=($=t.integration,Ce[$.toLowerCase()]??$.toUpperCase().slice(0,6));var $,w;switch(e){case"name_row":return G`
          <div class="tile-top">
            <div class="tile-left">
              <span class="dot ${l?"online":"offline"}"></span>
              <span class="tile-name">${t.name}</span>
              ${c?G`<span class="update-dot" title="Firmware update">●</span>`:V}
            </div>
            ${o?G`
              <div class="cov-btns" @click=${e=>e.stopPropagation()}>
                <button class="cov-btn" @click=${e=>this._coverAction(o.entityId,"open",e)}>▲</button>
                <button class="cov-btn stop" @click=${e=>this._coverAction(o.entityId,"stop",e)}>■</button>
                <button class="cov-btn" @click=${e=>this._coverAction(o.entityId,"close",e)}>▼</button>
              </div>
            `:r?G`
              <button class="tog ${g?"on":"off"}"
                @click=${e=>this._toggle(r.entityId,g,e)}>
                ${g?"ON":"OFF"}
              </button>
            `:a?G`
              <button class="tog ${_?"on":"off"}"
                @click=${e=>this._setHvacMode(a.entityId,_?"off":"heat",e)}>
                ${_?"HEAT":"OFF"}
              </button>
            `:t.isVirtual?G`
              <button class="tog off"
                @click=${async e=>{e.stopPropagation();const s=t.entities[0];s&&("script"===s.domain?await this.hass.callService("script","turn_on",{entity_id:s.entity_id}):"scene"===s.domain?await this.hass.callService("scene","turn_on",{entity_id:s.entity_id}):"automation"===s.domain&&await this.hass.callService("automation","trigger",{entity_id:s.entity_id}))}}>
                RUN
              </button>
            `:V}
          </div>
        `;case"sensors":return p.length?G`
          <div class="tile-sensor-chips">
            ${p.map(e=>G`
              <div class="tile-sensor-chip ${e.warn?"warn":""}">
                <span class="tsc-lbl">${e.label}</span>
                <span class="tsc-val">${e.value}</span>
              </div>
            `)}
          </div>
        `:G``;case"graph":return this._renderSparklines(t,i);case"dimmer":return r&&u?G`
          <div class="tile-dim-row" @click=${e=>e.stopPropagation()}>
            ${v?G`
              <input type="color" class="color-swatch tile-color-swatch" .value=${m}
                ?disabled=${!g}
                @change=${e=>{e.stopPropagation(),this._setColor(r.entityId,e.target.value,r.whiteValue,f)}}/>
            `:V}
            <input type="range" class="dim-slider" min="1" max="100"
              style=${ye(v?{accentColor:m}:{})}
              .value=${String(g?Math.max(1,r.brightness??1):1)}
              ?disabled=${!g}
              @input=${e=>{const t=e.target.closest(".tile-dim-row")?.querySelector(".dim-pct");t&&(t.textContent=`${e.target.value}%`)}}
              @change=${e=>{this._setBrightness(r.entityId,parseInt(e.target.value,10))}}/>
            <span class="dim-pct">${b}%</span>
          </div>
        `:G``;case"cover_controls":return o?G`
          <div class="cov-pos-row" @click=${e=>e.stopPropagation()}>
            <div class="cov-bar">
              <div class="cov-fill" style="width:${o.position??("open"===o.state?100:0)}%"></div>
            </div>
            <span class="cov-pct">${null!=o.position?`${Math.round(o.position)}%`:o.state}</span>
          </div>
        `:G``;case"trv_control":return a?G`
          <div class="tile-trv-row" @click=${e=>e.stopPropagation()}>
            <div class="trv-temps">
              ${null!=a.currentTemp?G`<span class="trv-cur">${a.currentTemp}°</span><span class="trv-sep">›</span>`:V}
              <span class="trv-target ${_?"heating":""}">${a.targetTemp??"—"}°</span>
            </div>
            ${"heating"===a.hvacAction?G`<span class="trv-flame">🔥</span>`:V}
            <div class="trv-step-btns">
              <button class="trv-step" @click=${()=>null!=a.targetTemp&&this._setTemp(a.entityId,a.targetTemp-a.step)}>−</button>
              <button class="trv-step" @click=${()=>null!=a.targetTemp&&this._setTemp(a.entityId,a.targetTemp+a.step)}>+</button>
            </div>
          </div>
        `:G``;case"input_channels":return h.length?G`
          <div class="tile-inputs" @click=${e=>e.stopPropagation()}>
            ${h.map(e=>G`
              <div class="input-chip ${e.isOn?"active":""}">
                <span class="input-dot"></span>
                <span class="input-lbl">${e.label}</span>
              </div>
            `)}
          </div>
        `:G``;case"fan_controls":{const e=this._getFan(t);return e?G`
          <div class="tile-dim-row" @click=${e=>e.stopPropagation()}>
            <input type="range" class="dim-slider" min="0" max="100" step="${e.percentageStep}"
              .value=${String(e.isOn?e.percentage??0:0)}
              ?disabled=${!e.isOn}
              @change=${t=>{t.stopPropagation();const s=parseInt(t.target.value,10);this.hass.callService("fan",s>0?"turn_on":"turn_off",{entity_id:e.entityId,...s>0?{percentage:s}:{}})}}/>
            <span class="dim-pct">${e.isOn?e.percentage??0:0}%</span>
            ${void 0!==e.oscillating?G`
              <button class="tog sm ${e.oscillating?"on":"off"}"
                @click=${t=>{t.stopPropagation(),this.hass.callService("fan","oscillate",{entity_id:e.entityId,oscillating:!e.oscillating})}}>
                ⟳
              </button>
            `:V}
          </div>
        `:G``}case"valve_controls":{const e=this._getValve(t);return e?G`
          <div class="tile-top" @click=${e=>e.stopPropagation()}>
            <div class="cov-btns">
              <button class="cov-btn" @click=${t=>this._valveAction(e.entityId,"open",t)}>▲</button>
              <button class="cov-btn stop" @click=${t=>this._valveAction(e.entityId,"stop",t)}>■</button>
              <button class="cov-btn" @click=${t=>this._valveAction(e.entityId,"close",t)}>▼</button>
            </div>
            ${null!=e.position?G`<span class="cov-pct">${Math.round(e.position)}%</span>`:V}
          </div>
        `:G``}case"media_controls":{const e=this._getMedia(t);return e?G`
          <div class="tile-media-row" @click=${e=>e.stopPropagation()}>
            ${e.title?G`<span class="media-title">${e.title}${e.artist?G` · <em class="media-artist">${e.artist}</em>`:V}</span>`:V}
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
            ${null!=e.volume?G`
              <input type="range" class="dim-slider" min="0" max="100" step="5"
                .value=${String(Math.round(100*(e.volume??0)))}
                @change=${t=>{t.stopPropagation(),this.hass.callService("media_player","volume_set",{entity_id:e.entityId,volume_level:parseInt(t.target.value)/100})}}/>
            `:V}
          </div>
        `:G``}case"power_bar":return this._renderPowerBar(t);case"badges":return G`
          <div class="tile-bot">
            ${null!=d?G`<span class="tile-power">${Ee(d)}</span>`:V}
            <div class="tile-badges">
              ${n.map(e=>G`<span class="alert-badge alert-${e}">${"overtemp"===e?"🌡":"⚡"}!</span>`)}
              ${s.label?G`<span class="type-badge type-${s.type}">${s.label}</span>`:V}
              ${y?G`<span class="gen-badge gen-${s.gen}">${y}</span>`:V}
              ${x&&!t.isVirtual?G`<span class="int-badge-tile">${x}</span>`:V}
              ${t.isShelly&&t.ip&&(w=t.ip,/^10\./.test(w)||/^192\.168\./.test(w)||/^172\.(1[6-9]|2\d|3[01])\./.test(w)||/^169\.254\./.test(w))?G`
                <a href="http://${t.ip}" target="_blank" class="tile-ui-link"
                  @click=${e=>e.stopPropagation()}>↗</a>
              `:V}
            </div>
          </div>
        `;default:return G``}}_renderPowerBar(e){if(!this._config.show_power_bar)return G``;const t=this._getPower(e)??0,s=this._config.power_bar_max??2e3;return G`
      <div class="power-bar" title="${t.toFixed(0)} W">
        <div class="power-bar-fill" style="width:${Math.min(100,t/s*100)}%"></div>
      </div>`}_renderTile(e){const t=this._isOnline(e),s=function(e){const t=(e.model??"").toLowerCase(),s=new Set(e.entities.map(e=>e.domain));if(e.isVirtual){const t=e.entities[0]?.domain??"generic",s="script"===t?"script":"scene"===t?"scene":"automation"===t?"automation":"weather"===t?"weather":"person"===t?"person":$e.has(t)?"helper":"generic";return{type:s,gen:"other",label:Se[s],integration:e.integration}}let i;if(s.has("climate")&&s.has("switch"))i="wall_display";else if(s.has("climate"))i="climate";else if(s.has("cover"))i="cover";else if(s.has("valve"))i="valve";else if(s.has("vacuum"))i="vacuum";else if(s.has("fan"))i="fan";else if(s.has("lock"))i="lock";else if(s.has("alarm_control_panel"))i="alarm";else if(s.has("humidifier"))i="humidifier";else if(s.has("media_player"))i="media_player";else if(s.has("camera"))i="camera";else if(s.has("light")){const t=e.entities.some(e=>"light"===e.domain&&(e.attributes?.supported_color_modes??[]).some(e=>["rgb","rgbw","rgbww","hs","xy"].includes(e)));i=t?"rgb":"dimmer"}else if(s.has("switch"))i=e.isShelly?t.includes("uni")?"uni":!t.includes("plug")&&(e.entities.some(e=>"binary_sensor"===e.domain&&e.entity_id.includes("input"))||t.includes("1pm")||t.includes("2pm")||t.includes("pro "))?"relay":"plug":t.includes("plug")||t.includes("outlet")?"plug":"switch";else{const t=e.entities.some(e=>"sensor"===e.domain&&("power"===e.attributes?.device_class||"energy"===e.attributes?.device_class||"apparent_power"===e.attributes?.device_class)),s=e.entities.some(e=>"binary_sensor"===e.domain&&(e.entity_id.includes("input")||e.entity_id.includes("button")||null==e.attributes?.device_class)),r=e.entities.some(e=>"sensor"===e.domain&&["temperature","humidity","illuminance","moisture","battery","gas"].includes(e.attributes?.device_class??"")),a=e.entities.some(e=>"binary_sensor"===e.domain&&["motion","door","window","moisture","smoke","gas","vibration","opening"].includes(e.attributes?.device_class??""));i=t?"energy":!s||r||a?"sensor":"input"}const r=e.isShelly?function(e){const t=e.toLowerCase();return t.includes("blu")||t.includes("bluetooth")?"ble":t.includes("g4")||t.includes("gen4")||t.includes("gen 4")?4:t.includes("g3")||t.includes("gen3")||t.includes("gen 3")||/^s3/i.test(e)?3:t.includes("plus")||t.includes("pro")||/^sn/i.test(e)?2:1}(e.model??""):"other";return{type:i,gen:r,label:Se[i],integration:e.integration}}(e),i=this._expandedDevice===e.device_id,r=this._config.tile_size??"md",a=this._config.device_styles?.[e.device_id]?.color,o={};a&&(o.borderColor=a,o.boxShadow=`0 0 12px ${a}50`);const n=this._getBlockOrder(e,s);return G`
      <div class="tile ${i?"expanded":""} ${t?"":"offline"} tile-${r}"
        style=${ye(o)}
        @click=${t=>{if("toggle"===this._config.tile_click){const s=this._getPrimarySwitch(e);s&&this._toggle(s.entityId,s.isOn,t)}else this._expandedDevice=this._expandedDevice===e.device_id?null:e.device_id}}>
        ${n.map(t=>this._renderBlock(t,e,s,i))}
      </div>
    `}_renderAreaSection(e,t){if(!t.length)return G``;const s=e||"No Area",i=this._closedAreas.has(e),r=t.filter(e=>this._isOnline(e)).length,a=t.reduce((e,t)=>e+(this._getPower(t)??0),0),o=this._config.area_styles?.[s],n=o?.columns??this._config.columns??3;this._config.style;const l={};o&&(o.bgImage?(l.backgroundImage=`url('${o.bgImage}')`,l.backgroundSize="stretch"===o.bgImageSize?"100% 100%":o.bgImageSize??"contain",l.backgroundPosition="center",l.backgroundRepeat="no-repeat"):o.bgColor&&(l.background=o.bgColor),(o.borderColor||o.borderWidth)&&(l.border=`${o.borderWidth??1}px ${o.borderStyle??"solid"} ${o.borderColor??"var(--divider-color)"}`),o.borderRadius&&(l.borderRadius=`${o.borderRadius}px`,l.overflow="hidden"),o.headerBgColor&&(l["--area-header-bg"]=o.headerBgColor2?`linear-gradient(${o.headerBgDir??"to right"}, ${o.headerBgColor}, ${o.headerBgColor2})`:o.headerBgColor),o.textColor&&(l["--area-header-color"]=o.textColor),o.fontSize&&(l["--area-name-size"]=`${o.fontSize}px`),o.fontWeight&&(l["--area-name-weight"]=o.fontWeight),o.tileBgColor&&(l["--sc-tile-bg"]=o.tileBgColor),o.tileBorderColor&&(l["--sc-tile-border"]=o.tileBorderColor),null!=o.tileBorderRadius&&(l["--tile-radius"]=`${o.tileBorderRadius}px`),null!=o.tileGap&&(l["--tile-gap"]=`${o.tileGap}px`),o.tileTextColor&&(l["--sc-text-primary"]=o.tileTextColor),o.accentColor&&(l["--sc-accent"]=o.accentColor,l["--sc-graph-line"]=o.accentColor,l["--sc-accent-glow"]=`${o.accentColor}59`));const c=i?void 0:t.find(e=>e.device_id===this._expandedDevice),d=c?t.indexOf(c):-1,p=d>=0?Math.min(Math.floor(d/n)*n+n-1,t.length-1):-1,h=c?G`
      <div class="tile-expanded-panel" @click=${e=>e.stopPropagation()}>
        <div class="expanded-graph-header">
          <button class="spark-refresh-all" @click=${e=>{e.stopPropagation(),this._refreshAllGraphs(c)}}>↺ Refresh graphs</button>
        </div>
        ${this._renderSparklines(c,!0)}
        ${this._renderExpanded(c)}
      </div>
    `:V,g=t.flatMap((e,t)=>{const s=this._renderTile(e);return t===p?[s,h]:[s]});return G`
      <div class="area-section ${i?"closed":""}" style=${ye(l)}>
        <div class="area-header" @click=${()=>{const t=new Set(this._closedAreas);t.has(e)?t.delete(e):t.add(e),this._closedAreas=t}}>
          <span class="area-name">${s}</span>
          <div class="area-meta">
            <span class="area-count">${r}/${t.length}</span>
            ${a>0?G`<span class="area-power">${Ee(a)}</span>`:V}
            <span class="chevron ${i?"":"open"}">▼</span>
          </div>
        </div>
        ${i?V:G`
          <div class="device-grid" style="--cols:${n}">
            ${g}
          </div>
        `}
      </div>
    `}_renderExpanded(e){const t=this._getSensors(e),s=this._getFirmware(e),i=this._getTrv(e),r=this._getCover(e),a=this._getValve(e),o=!1!==this._config.show_entity_list,n=this._entityListOpen.has(e.device_id);return G`
      <div class="expanded" @click=${e=>e.stopPropagation()}>

        ${r?G`
          <div class="exp-section exp-section--cover">
            <div class="exp-label">Cover</div>
            <div class="trv-mode-row">
              <button class="tog sm ${"open"===r.state?"on":"off"}" @click=${e=>this._coverAction(r.entityId,"open",e)}>Open</button>
              <button class="tog sm off" @click=${e=>this._coverAction(r.entityId,"stop",e)}>Stop</button>
              <button class="tog sm ${"closed"===r.state?"on":"off"}" @click=${e=>this._coverAction(r.entityId,"close",e)}>Close</button>
            </div>
            ${null!=r.position?G`
              <div class="dim-wrap" style="margin-top:8px">
                <span class="trv-range-lbl">0%</span>
                <input type="range" class="dim-slider" min="0" max="100" step="5"
                  style="accent-color:var(--sc-accent)"
                  .value=${String(r.position)}
                  @change=${e=>{e.stopPropagation(),this._setCoverPosition(r.entityId,parseFloat(e.target.value))}}/>
                <span class="trv-range-lbl">100%</span>
              </div>
              <div style="text-align:center;font-size:12px;color:var(--sc-text-secondary);margin-top:2px">Position: ${Math.round(r.position)}%</div>
            `:V}
          </div>
        `:V}

        ${i?G`
          <div class="exp-section exp-section--trv">
            <div class="exp-label">Thermostat</div>
            <div class="trv-ctrl-row">
              <button class="trv-big-btn" @click=${e=>{e.stopPropagation(),null!=i.targetTemp&&this._setTemp(i.entityId,Math.max(i.minTemp,i.targetTemp-i.step))}}>−</button>
              <div class="trv-display">
                <span class="trv-target-big">${null!=i.targetTemp?i.targetTemp.toFixed(1):"—"}°</span>
                ${null!=i.currentTemp?G`<span class="trv-current-sub">now ${i.currentTemp}°</span>`:V}
                ${"heating"===i.hvacAction?G`<span class="trv-action-badge heating">Heating</span>`:V}
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
        `:V}

        ${a?G`
          <div class="exp-section">
            <div class="exp-label">Valve</div>
            <div class="trv-mode-row">
              <button class="tog sm ${"open"===a.state?"on":"off"}" @click=${e=>this._valveAction(a.entityId,"open",e)}>Open</button>
              <button class="tog sm off" @click=${e=>this._valveAction(a.entityId,"stop",e)}>Stop</button>
              <button class="tog sm ${"closed"===a.state?"on":"off"}" @click=${e=>this._valveAction(a.entityId,"close",e)}>Close</button>
            </div>
            ${null!=a.position?G`
              <div class="dim-wrap" style="margin-top:8px">
                <span class="trv-range-lbl">0%</span>
                <input type="range" class="dim-slider" min="0" max="100" step="5"
                  style="accent-color:var(--sc-accent)"
                  .value=${String(a.position)}
                  @change=${e=>{e.stopPropagation(),this._setValvePosition(a.entityId,parseFloat(e.target.value))}}/>
                <span class="trv-range-lbl">100%</span>
              </div>
              <div style="text-align:center;font-size:12px;color:var(--sc-text-secondary);margin-top:2px">Position: ${Math.round(a.position)}%</div>
            `:V}
          </div>
        `:V}

        ${t.length?G`
          <div class="exp-section">
            <div class="exp-label">Sensors</div>
            <div class="sensor-row">
              ${t.map(e=>G`
                <div class="sensor-chip">
                  <span class="sensor-label">${e.label}</span>
                  <span class="sensor-value ${e.warn?"warn":""}">${e.value}</span>
                </div>
              `)}
            </div>
          </div>
        `:V}

        ${s?G`
          <div class="exp-section">
            <div class="exp-label">Firmware update available</div>
            <div class="exp-row">
              <span class="exp-name">${s.newVersion??"New version"}</span>
              <button class="tog sm update" @click=${e=>this._installUpdate(s.entityId,e)}>Install</button>
            </div>
          </div>
        `:V}

        ${o?G`
          <div class="exp-section exp-section--full">
            <div class="ent-list-header" @click=${t=>{t.stopPropagation();const s=new Set(this._entityListOpen);n?s.delete(e.device_id):s.add(e.device_id),this._entityListOpen=s}}>
              <span class="exp-label" style="margin:0">All Entities (${e.entities.length})</span>
              <span class="ent-caret ${n?"open":""}">▼</span>
            </div>
            ${n?G`
              <div class="ent-list">
                ${e.entities.filter(e=>!(this._config.hidden_entities??[]).includes(e.entity_id)).map(e=>{const t=this.hass.states[e.entity_id],s=t?.state??"unavailable",i=t?.attributes?.unit_of_measurement??"",r=t?.attributes?.friendly_name??e.entity_id.split(".")[1].replace(/_/g," "),a=["switch","light","input_boolean","fan"].includes(e.domain);return G`
                      <div class="ent-row">
                        <span class="ent-domain">${e.domain}</span>
                        <span class="ent-name">${r}</span>
                        <span class="ent-state">${i?`${s} ${i}`:s}</span>
                        ${a?G`
                          <button class="tog sm ${"on"===s?"on":"off"}"
                            @click=${t=>this._toggle(e.entity_id,"on"===s,t)}>
                            ${"on"===s?"ON":"OFF"}
                          </button>
                        `:V}
                      </div>
                    `})}
              </div>
            `:V}
          </div>
        `:V}

      </div>
    `}render(){if(!this._config||!this.hass)return G``;const e=this._getDevices(),t=this._config.style??{};if(!e.length)return G`
        <ha-card>
          <div class="empty">
            <p>No devices found.</p>
            <p class="hint">Devices are auto-discovered via the HA entity registry.</p>
          </div>
        </ha-card>`;const s=e.filter(e=>this._isOnline(e)).length,i=e.length-s,r=e.reduce((e,t)=>e+(this._getPower(t)??0),0),a=e.filter(e=>this._getAlerts(e).length>0),o=this._groupByArea(e),n={};t.accent_color&&(n["--sc-accent"]=t.accent_color),t.tile_radius&&(n["--tile-radius"]=`${t.tile_radius}px`),t.tile_gap&&(n["--tile-gap"]=`${t.tile_gap}px`),t.font_family&&(n.fontFamily=t.font_family),t.tile_bg&&(n["--sc-tile-bg"]=t.tile_bg),t.tile_border&&(n["--sc-tile-border"]=t.tile_border),t.text_primary&&(n["--sc-text-primary"]=t.text_primary),t.online_color&&(n["--sc-online-color"]=t.online_color),t.power_color&&(n["--sc-power-color"]=t.power_color),this._config.graph_line_color&&(n["--sc-graph-line"]=this._config.graph_line_color),t.header_bg&&t.header_bg2?n["--sc-header-bg"]=`linear-gradient(135deg, ${t.header_bg} 0%, ${t.header_bg2} 100%)`:t.header_bg&&(n["--sc-header-bg"]=t.header_bg);const l=this._config.tile_opacity??100;return l<100&&(n["--sc-tile-bg"]=`color-mix(in srgb, ${t.tile_bg??"rgba(255,255,255,0.04)"} ${l}%, transparent)`),G`
      <ha-card style=${ye(n)}>
        <div class="dash-header">
          <span class="dash-title">HA Devices</span>
          <div class="dash-stats">
            <span class="stat online">${s}/${e.length} online</span>
            ${i>0?G`<span class="stat offline-count">${i} offline</span>`:V}
            <span class="stat power">${Ee(r)}</span>
            ${a.length>0?G`<span class="stat alerts-count">⚠ ${a.length}</span>`:V}
          </div>
        </div>
        <div class="dash-body">
          ${[...o.entries()].map(([e,t])=>this._renderAreaSection(e,t))}
        </div>
      </ha-card>
    `}};var qe,Ve;We.BRIGHTNESS_MAX=255,We.styles=o`
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
    }

    ha-card {
      overflow-x: hidden; overflow-y: visible;
      background: var(--ha-card-background, var(--card-background-color, #1c1c1e));
      container-type: inline-size; container-name: ha-dash;
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
    .area-name { font-size:var(--area-name-size,0.78em); font-weight:var(--area-name-weight,700); text-transform:uppercase; letter-spacing:0.08em; color:var(--area-header-color,var(--sc-accent)); }
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
      background:var(--sc-tile-bg); border:1px solid var(--sc-tile-border);
      border-radius:var(--tile-radius); padding:11px 13px; cursor:pointer;
      transition:transform 0.15s, box-shadow 0.15s, background 0.15s;
      display:flex; flex-direction:column; gap:6px; position:relative; overflow:hidden;
    }
    .tile::before {
      content:''; position:absolute; top:0;left:0;right:0; height:2px;
      background:linear-gradient(90deg,var(--sc-accent),transparent); opacity:0; transition:opacity 0.2s;
    }
    .tile:hover { transform:translateY(-2px); box-shadow:0 6px 20px var(--sc-tile-hover-shad); background:var(--sc-tile-hover-bg); }
    .tile:hover::before { opacity:1; }
    .tile.offline { opacity:.45; filter:grayscale(.4); }
    .tile.expanded { background:var(--sc-tile-exp-bg); border-color:var(--sc-accent); box-shadow:0 0 0 1px var(--sc-accent),0 4px 12px var(--sc-accent-glow); transform:none; }
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

    .tile-name { font-size:.88em; font-weight:600; color:var(--sc-text-primary); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; min-width:0; }
    .update-dot { color:var(--sc-update-color); font-size:.55em; flex-shrink:0; animation:blink 2s step-end infinite; }
    @keyframes blink { 50%{opacity:.3} }

    .tile-sensor-chips { display:flex; flex-wrap:wrap; gap:4px; margin:2px 0 0; }
    .tile-sensor-chip { display:flex; flex-direction:column; align-items:center; background:rgba(255,255,255,.05); border:1px solid rgba(255,255,255,.08); border-radius:6px; padding:2px 7px; min-width:38px; }
    .tsc-lbl { font-size:.6em; color:var(--sc-text-muted); text-transform:uppercase; letter-spacing:.03em; }
    .tsc-val { font-size:.78em; color:var(--sc-text-primary); font-weight:500; }
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

    .tog { padding:4px 11px; border:none; border-radius:20px; cursor:pointer; font-size:.72em; font-weight:700; letter-spacing:.05em; flex-shrink:0; transition:transform .1s,opacity .15s,box-shadow .15s; position:relative; overflow:hidden; }
    .tog::after { content:''; position:absolute; inset:0; background:white; opacity:0; transition:opacity .15s; }
    .tog:active::after { opacity:.15; }
    .tog.sm { padding:2px 9px; font-size:.68em; }
    .tog.on { background:linear-gradient(135deg,var(--sc-accent),color-mix(in srgb,var(--sc-accent) 70%,#f97316)); color:white; box-shadow:0 2px 8px var(--sc-accent-glow); }
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
    .sensor-value { font-size:.85em; font-weight:600; color:var(--sc-text-value); font-variant-numeric:tabular-nums; }
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
    .spark-lbl { font-size:.62em; font-weight:700; text-transform:uppercase; letter-spacing:.05em; color:var(--sc-text-muted); width:34px; flex-shrink:0; text-align:right; }
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
    .spark-time-spacer { width:34px; flex-shrink:0; }
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
  `,e([ue({attribute:!1})],We.prototype,"hass",void 0),e([be()],We.prototype,"_config",void 0),e([be()],We.prototype,"_expandedDevice",void 0),e([be()],We.prototype,"_closedAreas",void 0),e([be()],We.prototype,"_entityListOpen",void 0),e([be()],We.prototype,"_graphData",void 0),We=Ge=e([pe("ha-device-dashboard")],We),function(e){e.language="language",e.system="system",e.comma_decimal="comma_decimal",e.decimal_comma="decimal_comma",e.space_comma="space_comma",e.none="none"}(qe||(qe={})),function(e){e.language="language",e.system="system",e.am_pm="12",e.twenty_four="24"}(Ve||(Ve={}));const Ye={dark_industrial:{accent_color:"#f4601e",header_bg:"#1a1a2e",header_bg2:"#0f3460",tile_bg:"rgba(255,255,255,0.04)",tile_border:"rgba(255,255,255,0.07)",text_primary:"#e5e7eb",online_color:"#4ade80",power_color:"#fb923c"},teal_terminal:{accent_color:"#2dd4bf",header_bg:"#0d1f1f",header_bg2:"#0a1515",tile_bg:"rgba(0,180,160,0.05)",tile_border:"rgba(0,180,160,0.15)",text_primary:"#c0d0cf",online_color:"#00e676",power_color:"#2dd4bf"},brutalist:{accent_color:"#ff4500",header_bg:"#111",header_bg2:"#111",tile_bg:"#f5f0e8",tile_border:"#111",text_primary:"#111",online_color:"#00cc44",power_color:"#ff4500"},frosted_light:{accent_color:"#ff5722",header_bg:"rgba(255,255,255,0.4)",header_bg2:"rgba(255,255,255,0.2)",tile_bg:"rgba(255,255,255,0.65)",tile_border:"rgba(255,255,255,0.8)",text_primary:"#212121",online_color:"#4caf50",power_color:"#ff5722"},nordic_warm:{accent_color:"#c0631a",header_bg:"#fffdf9",header_bg2:"#f5ede4",tile_bg:"#fffdf9",tile_border:"#ede5d8",text_primary:"#2c2118",online_color:"#5daa6d",power_color:"#c0631a"},midnight_purple:{accent_color:"#a78bfa",header_bg:"#0a0a0a",header_bg2:"#1a1a2e",tile_bg:"rgba(167,139,250,0.05)",tile_border:"rgba(167,139,250,0.15)",text_primary:"#e2e8f0",online_color:"#4ade80",power_color:"#c084fc"},custom:{}},Ze={dark_industrial:"Dark Industrial",teal_terminal:"Teal Terminal",brutalist:"Brutalist",frosted_light:"Frosted Light",nordic_warm:"Nordic Warm",midnight_purple:"Midnight Purple",custom:"Custom"},Ke=[{group:"Electrical",items:[{key:"power",label:"Power"},{key:"apparent_power",label:"App. Power"},{key:"reactive_power",label:"React. Power"},{key:"power_factor",label:"Pwr Factor"},{key:"frequency",label:"Frequency"},{key:"energy",label:"Energy"},{key:"voltage",label:"Voltage"},{key:"current",label:"Current"}]},{group:"Environmental",items:[{key:"temperature",label:"Temperature"},{key:"humidity",label:"Humidity"},{key:"illuminance",label:"Light"},{key:"co2",label:"CO₂"},{key:"gas",label:"Gas"}]},{group:"Device",items:[{key:"battery",label:"Battery"},{key:"rssi",label:"Wi-Fi RSSI"},{key:"uptime",label:"Uptime"},{key:"ip",label:"IP Address"},{key:"ssid",label:"SSID"},{key:"fw_version",label:"Firmware"},{key:"mac",label:"MAC"},{key:"cloud",label:"Cloud"},{key:"mqtt",label:"MQTT"},{key:"eth",label:"Ethernet"}]},{group:"Alerts",items:[{key:"motion",label:"Motion"},{key:"door",label:"Door/Window"},{key:"flood",label:"Flood"},{key:"smoke",label:"Smoke"},{key:"vibration",label:"Vibration"},{key:"overpower",label:"Overpower"},{key:"overtemp",label:"Overtemp"}]}],Xe=[{id:"name_row",label:"Name row",sub:"Device name · status dot · primary control"},{id:"sensors",label:"Sensor chips",sub:"Power, temp, voltage, RSSI…"},{id:"graph",label:"Sparkline graph",sub:"History sparklines per selected sensor"},{id:"dimmer",label:"Dimmer / color",sub:"Brightness slider + colour picker for lights"},{id:"cover_controls",label:"Cover controls",sub:"Open · Stop · Close + position bar"},{id:"trv_control",label:"Thermostat",sub:"Temperature display + ± buttons + slider"},{id:"media_controls",label:"Media controls",sub:"Play/pause/stop · volume · source"},{id:"fan_controls",label:"Fan controls",sub:"Speed, oscillation, direction"},{id:"valve_controls",label:"Valve controls",sub:"Open · Stop · Close + position bar"},{id:"input_channels",label:"Input channels",sub:"Binary input chips (i3/i4/button modules)"},{id:"power_bar",label:"Power bar",sub:"Mini usage bar at tile bottom"},{id:"badges",label:"Type & gen badges",sub:"Dimmer · G3 · Relay labels + UI link"}],Qe=["name_row","sensors","graph","dimmer","cover_controls","trv_control","media_controls","fan_controls","valve_controls","input_channels","power_bar","badges"],Je=[{key:"shelly",label:"Shelly",color:"#f4601e"},{key:"zha",label:"ZHA",color:"#4a9eff"},{key:"mqtt",label:"MQTT",color:"#fbbf24"},{key:"hue",label:"Hue",color:"#fde047"},{key:"deconz",label:"deCONZ",color:"#818cf8"},{key:"esphome",label:"ESPHome",color:"#4ade80"},{key:"matter",label:"Matter",color:"#2dd4bf"},{key:"tuya",label:"Tuya",color:"#f472b6"},{key:"tasmota",label:"Tasmota",color:"#fb923c"},{key:"wled",label:"WLED",color:"#c084fc"},{key:"tplink",label:"Kasa",color:"#34d399"},{key:"sonos",label:"Sonos",color:"#7dd3fc"}];let et=class extends ce{constructor(){super(...arguments),this._tab="devices",this._openSections=new Set(["integrations","rooms","sort"]),this._expandedRooms=new Set,this._areaStyleTab={},this._editingArea=null,this._dragSrc=null,this._deviceSearch=""}setConfig(e){this._config=e}_val(e){return this._config[e]}_set(e,t){if(!this._config)return;const s={...this._config,[e]:t};!["areas","integrations","graph_sensors","sensors","tile_layout","entity_domains"].includes(e)&&(void 0===t||""===t||Array.isArray(t)&&0===t.length)&&delete s[e],function(e,t,s,i){i=i||{},s=null==s?{}:s;var r=new Event(t,{bubbles:void 0===i.bubbles||i.bubbles,cancelable:Boolean(i.cancelable),composed:void 0===i.composed||i.composed});r.detail=s,e.dispatchEvent(r)}(this,"config-changed",{config:s})}_setStyle(e,t){const s={...this._config.style??{}};void 0===t||""===t?delete s[e]:s[e]=t,this._set("style",Object.keys(s).length?s:void 0)}_setAreaStyle(e,t,s){const i={...this._config.area_styles??{}},r={...i[e]??{}};void 0===s||""===s||0===s?delete r[t]:r[t]=s,Object.keys(r).length>0?i[e]=r:delete i[e],this._set("area_styles",Object.keys(i).length?i:void 0)}_clearAreaStyle(e){const t={...this._config.area_styles??{}};delete t[e],this._set("area_styles",Object.keys(t).length?t:void 0)}_setGraphStyle(e,t){const s={...this._config.graph_style??{}};void 0===t?delete s[e]:s[e]=t,this._set("graph_style",Object.keys(s).length?s:void 0)}_getAreas(){return this.hass?Object.values(this.hass.areas??{}).map(e=>({id:e.area_id,name:e.name})).sort((e,t)=>e.name.localeCompare(t.name)):[]}_getDiscoveredDevices(){return this.hass?we(this.hass,this._config.integrations):[]}_getAllHADevices(){return this.hass,we(this.hass)}_toggleSection(e){const t=new Set(this._openSections);t.has(e)?t.delete(e):t.add(e),this._openSections=t}_toggleIntegration(e){const t=[...this._config.integrations??[]],s=t.indexOf(e);s>=0?t.splice(s,1):t.push(e),this._set("integrations",t)}_toggleArea(e){const t=[...this._config.areas??[]],s=t.indexOf(e);s>=0?t.splice(s,1):t.push(e),this._set("areas",t)}_toggleSensor(e){const t=[...this._config.sensors??[]],s=t.indexOf(e);s>=0?t.splice(s,1):t.push(e),this._set("sensors",t)}_toggleGraphSensor(e){const t=[...this._config.graph_sensors??[]],s=t.indexOf(e);s>=0?t.splice(s,1):t.push(e),this._set("graph_sensors",t)}_toggleGroupSensors(e,t){const s=Ke.find(t=>t.group===e)?.items??[],i=s.map(e=>e.key),r=[...this._config[t]??[]],a=i.every(e=>r.includes(e)),o=a?r.filter(e=>!i.includes(e)):[...new Set([...r,...i])];this._set(t,o)}_getBlockOrder(){return this._config.tile_layout??Qe}_moveBlock(e,t){const s=[...this._getBlockOrder()],[i]=s.splice(e,1);s.splice(t,0,i),this._set("tile_layout",s)}_section(e,t,s,i,r,a,o){const n=this._openSections.has(e);return G`
      <div class="sec ${n?"open":""}">
        <div class="sec-hdr" @click=${()=>this._toggleSection(e)}>
          <div class="sec-hdr-l">
            <div class="sec-ico" style=${i}>${s}</div>
            <span class="sec-title">${t}</span>
          </div>
          <div class="sec-hdr-r">
            ${a?G`<span class="sec-badge" style=${o??""}>${a}</span>`:V}
            <span class="chev">▼</span>
          </div>
        </div>
        ${n?G`<div class="sec-body">${r}</div>`:V}
      </div>
    `}_togRow(e,t,s,i=!1){const r=this._config[s]??i;return G`
      <div class="tog-row">
        <div>
          <div class="tog-lbl">${e}</div>
          ${t?G`<div class="tog-sub">${t}</div>`:V}
        </div>
        <label class="sw">
          <input type="checkbox" .checked=${r}
            @change=${e=>this._set(s,e.target.checked)}>
          <span class="sw-track"></span><span class="sw-thumb"></span>
        </label>
      </div>
    `}_pills(e,t,s){return G`
      <div class="pill-grp">
        ${e.map(e=>G`
          <span class="pill ${t===e.value?"on":""}"
            @click=${()=>s(e.value)}>${e.label}</span>
        `)}
      </div>
    `}_colorRow(e,t,s,i,r){const a=t??s;return G`
      <div class="col-row">
        <div class="col-swatch-wrap">
          <div class="col-dot" style="background:${a}"></div>
          <input type="color" .value=${a} @change=${e=>i(e.target.value)}>
        </div>
        <span class="col-name">${e}</span>
        <span class="col-hex">${a}</span>
        ${t?G`<button class="col-reset" @click=${r}>↺</button>`:V}
      </div>
    `}_sliderRow(e,t,s,i,r,a,o){return G`
      <div class="sl-row">
        <div class="sl-label">${e} — <span class="sl-accent">${t}${a}</span></div>
        <input type="range" .min=${String(s)} .max=${String(i)} .step=${String(r)}
          .value=${String(t)}
          @input=${e=>o(parseFloat(e.target.value))}>
      </div>
    `}_renderDevicesTab(){const e=this._config,t=e.integrations??[],s=e.areas??[],i=this._getAreas(),r=G`
      ${Je.map(e=>G`
        <div class="int-row">
          <span class="int-badge" style="background:${e.color}22;color:${e.color};border:1px solid ${e.color}44">
            ${e.label.toUpperCase().slice(0,6)}
          </span>
          <span class="int-name">${e.label}</span>
          <label class="sw">
            <input type="checkbox"
              .checked=${0===t.length||t.includes(e.key)}
              @change=${t=>this._toggleIntegration(e.key)}>
            <span class="sw-track"></span><span class="sw-thumb"></span>
          </label>
        </div>
      `)}
      <div class="divider"></div>
      ${this._togRow("Include virtual entities","Scripts, scenes, automations, helpers","include_entities")}
    `,a=G`
      <div class="search-wrap">
        <span class="search-icon">⌕</span>
        <input type="text" placeholder="Filter rooms…" .value=${this._deviceSearch}
          @input=${e=>{this._deviceSearch=e.target.value}}>
      </div>
      ${i.filter(e=>!this._deviceSearch||e.name.toLowerCase().includes(this._deviceSearch.toLowerCase())).map(t=>{const i=0===s.length||s.includes(t.name),r=!!e.area_styles?.[t.name];return G`
            <div class="room-row">
              <div class="room-dot" style="background:${i?"#4ade80":"var(--text3)"}"></div>
              <span class="room-name">${t.name}</span>
              ${r?G`<span class="room-styled-badge">styled</span>`:V}
              <label class="sw">
                <input type="checkbox" .checked=${i}
                  @change=${()=>this._toggleArea(t.name)}>
                <span class="sw-track"></span><span class="sw-thumb"></span>
              </label>
              <button class="room-style-btn"
                @click=${()=>{this._editingArea=this._editingArea===t.name?null:t.name,this._tab="style"}}>Style ›</button>
            </div>
          `})}
    `,o=G`
      <div class="field">
        <div class="field-lbl">Sort devices by</div>
        ${this._pills([{value:"name",label:"Name"},{value:"power",label:"Power"},{value:"online",label:"Online first"},{value:"area",label:"Area"}],e.sort_by??"name",e=>this._set("sort_by",e))}
      </div>
      <div class="field">
        <div class="field-lbl">View mode</div>
        ${this._pills([{value:"grid",label:"Grid"},{value:"list",label:"List"},{value:"compact",label:"Compact"}],e.view_mode??"grid",e=>this._set("view_mode",e))}
      </div>
      ${this._togRow("Show offline devices",void 0,"show_offline",!0)}
      ${this._togRow("Tile click: expand → toggle","ON = click tile toggles device, OFF = click expands","tile_click",!1)}
    `;return G`
      ${this._section("integrations","Integrations","⬡","background:rgba(74,158,255,0.1);color:#4a9eff",r,t.length?`${t.length} active`:"All","background:rgba(74,158,255,0.1);color:#4a9eff")}
      ${this._section("rooms","Rooms","⌂","background:rgba(74,222,128,0.1);color:#4ade80",a,s.length?`${s.length}/${i.length}`:"All","background:rgba(74,222,128,0.1);color:#4ade80")}
      ${this._section("sort","Sort & View","⊞","background:rgba(167,139,250,0.1);color:#a78bfa",o)}
    `}_renderLayoutTab(){const e=this._config,t=this._getBlockOrder(),s=G`
      <div class="field">
        <div class="field-lbl">Columns</div>
        <div class="step-row">
          <button class="step-btn" @click=${()=>{const t=Math.max(1,(e.columns??3)-1);this._set("columns",t)}}>−</button>
          <span class="step-val">${e.columns??3}</span>
          <button class="step-btn" @click=${()=>{const t=Math.min(6,(e.columns??3)+1);this._set("columns",t)}}>+</button>
        </div>
        <div class="field-hint">Overridden per-room in the Style tab</div>
      </div>
      <div class="field">
        <div class="field-lbl">Tile size</div>
        ${this._pills([{value:"sm",label:"Small"},{value:"md",label:"Medium"},{value:"lg",label:"Large"}],e.tile_size??"md",e=>this._set("tile_size",e))}
      </div>
      ${this._sliderRow("Tile gap",e.style?.tile_gap??10,4,24,2,"px",e=>this._setStyle("tile_gap",e))}
    `,i=G`
      <div class="preview-label">Drag to reorder · click eye to hide</div>
      <div class="drag-list" id="drag-list">
        ${t.map((e,s)=>{const i=Xe.find(t=>t.id===e);return i?G`
            <div class="drag-item"
              draggable="true"
              data-idx=${s}
              @dragstart=${t=>{this._dragSrc=e,t.dataTransfer.effectAllowed="move"}}
              @dragover=${e=>{e.preventDefault(),e.dataTransfer.dropEffect="move"}}
              @drop=${i=>{if(i.stopPropagation(),this._dragSrc&&this._dragSrc!==e){const e=t.indexOf(this._dragSrc),i=s;this._moveBlock(e,i)}this._dragSrc=null}}
              @dragend=${()=>{this._dragSrc=null}}>
              <div class="drag-handle"><span></span><span></span><span></span></div>
              <div style="flex:1;min-width:0">
                <div class="drag-label">${i.label}</div>
                <div class="drag-sub">${i.sub}</div>
              </div>
            </div>
          `:V})}
      </div>
      <button class="reset-btn" @click=${()=>this._set("tile_layout",void 0)}>
        ↺ Reset to default order
      </button>
    `,r=G`
      ${this._sliderRow("Card background",e.tile_opacity??100,0,100,1,"%",e=>this._set("tile_opacity",e))}
      ${this._togRow("Show mini power bar","Usage bar at the bottom of each tile","show_power_bar")}
      ${e.show_power_bar?G`
        ${this._sliderRow("Power bar max",e.power_bar_max??2e3,100,1e4,100,"W",e=>this._set("power_bar_max",e))}
      `:V}
      ${this._togRow("Show entity list in expanded view","All Entities collapsible in expanded tile","show_entity_list",!0)}
    `;return G`
      ${this._section("grid","Grid","⊟","background:rgba(45,212,191,0.1);color:#2dd4bf",s)}
      ${this._section("blocks","Tile Block Order","↕","background:rgba(244,96,30,0.1);color:#f4601e",i)}
      ${this._section("opacity","Opacity & Options","◑","background:rgba(167,139,250,0.1);color:#a78bfa",r)}
    `}_renderStyleTab(){const e=this._config,t=e.style??{},s=e.theme??"dark_industrial",i=G`
      <div class="preset-grid">
        ${Object.keys(Ye).filter(e=>"custom"!==e).map(e=>G`
            <div class="preset-card ${s===e?"active":""}"
              @click=${()=>{this._set("theme",e);const s=Ye[e],i={...t,...s};this._set("style",Object.keys(i).length?i:void 0)}}>
              <div class="preset-preview" style="background:${Ye[e].header_bg??"#1a1a2e"}">
                <div style="height:28px;width:40%;background:${Ye[e].accent_color??"#f4601e"};border-radius:3px;margin-right:4px"></div>
                <div style="flex:1;display:flex;flex-direction:column;gap:3px">
                  <div style="height:10px;background:${Ye[e].tile_bg??"rgba(255,255,255,0.1)"};border-radius:2px"></div>
                  <div style="height:10px;background:${Ye[e].tile_bg??"rgba(255,255,255,0.1)"};border-radius:2px;width:70%"></div>
                </div>
              </div>
              <div class="preset-name">${Ze[e]}</div>
            </div>
        `)}
      </div>
    `,r=G`
      ${this._colorRow("Accent / brand",t.accent_color,"#f4601e",e=>this._setStyle("accent_color",e),()=>this._setStyle("accent_color",void 0))}
      ${this._colorRow("Text primary",t.text_primary,"#e5e7eb",e=>this._setStyle("text_primary",e),()=>this._setStyle("text_primary",void 0))}
      ${this._colorRow("Online dot",t.online_color,"#4ade80",e=>this._setStyle("online_color",e),()=>this._setStyle("online_color",void 0))}
      ${this._colorRow("Power reading",t.power_color,"#fb923c",e=>this._setStyle("power_color",e),()=>this._setStyle("power_color",void 0))}
      ${this._colorRow("Tile background",t.tile_bg,"rgba(255,255,255,0.04)",e=>this._setStyle("tile_bg",e),()=>this._setStyle("tile_bg",void 0))}
      ${this._colorRow("Tile border",t.tile_border,"rgba(255,255,255,0.07)",e=>this._setStyle("tile_border",e),()=>this._setStyle("tile_border",void 0))}
      <div class="col-row">
        <span class="col-name">Header background</span>
      </div>
      ${this._colorRow("Start",t.header_bg,"#1a1a2e",e=>this._setStyle("header_bg",e),()=>this._setStyle("header_bg",void 0))}
      ${this._colorRow("End (gradient)",t.header_bg2,"#0f3460",e=>this._setStyle("header_bg2",e),()=>this._setStyle("header_bg2",void 0))}
    `,a=G`
      <div class="field">
        <div class="field-lbl">Font family</div>
        ${[{name:"DM Sans",sample:"Ljós yfir vaska · 4.1 W",css:"'DM Sans', sans-serif"},{name:"IBM Plex Mono",sample:"Ljós yfir vaska · 4.1 W",css:"'IBM Plex Mono', monospace"},{name:"Rajdhani",sample:"Ljós yfir vaska · 4.1 W",css:"'Rajdhani', sans-serif"},{name:"Syne",sample:"Ljós yfir vaska · 4.1 W",css:"'Syne', sans-serif"}].map(e=>G`
          <div class="font-opt ${(t.font_family??"'DM Sans', sans-serif")===e.css?"active":""}"
            @click=${()=>this._setStyle("font_family",e.css)}>
            <div class="font-name">${e.name}</div>
            <div class="font-sample" style="font-family:${e.css}">${e.sample}</div>
          </div>
        `)}
      </div>
    `,o=G`
      <div class="btn-preview">
        <span class="preview-on" style="
          padding: ${{sm:"3px 8px",md:"4px 12px",lg:"6px 18px"}[t.button_size??"md"]};
          border-radius: ${{pill:"20px",rect:"6px",square:"8px"}[t.button_shape??"pill"]};
          background: ${"fill"!==t.button_variant&&t.button_variant?"transparent":t.accent_color??"#f4601e"};
          border: ${{fill:"none",outline:`1px solid ${t.accent_color??"#f4601e"}`,ghost:"none"}[t.button_variant??"fill"]};
          color: ${"fill"!==t.button_variant&&t.button_variant?t.accent_color??"#f4601e":"white"};
          font-size: ${{sm:"10px",md:"11px",lg:"13px"}[t.button_size??"md"]};
          font-weight:700; letter-spacing:0.06em;">ON</span>
        <span class="preview-off" style="
          padding: ${{sm:"3px 8px",md:"4px 12px",lg:"6px 18px"}[t.button_size??"md"]};
          border-radius: ${{pill:"20px",rect:"6px",square:"8px"}[t.button_shape??"pill"]};
          background: rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.1);
          color:rgba(255,255,255,0.5);
          font-size: ${{sm:"10px",md:"11px",lg:"13px"}[t.button_size??"md"]};
          font-weight:700; letter-spacing:0.06em;">OFF</span>
      </div>
      <div class="field">
        <div class="field-lbl">Shape</div>
        ${this._pills([{value:"pill",label:"Pill"},{value:"rect",label:"Rect"},{value:"square",label:"Square"}],t.button_shape??"pill",e=>this._setStyle("button_shape",e))}
      </div>
      <div class="field">
        <div class="field-lbl">Variant</div>
        ${this._pills([{value:"fill",label:"Fill"},{value:"outline",label:"Outline"},{value:"ghost",label:"Ghost"}],t.button_variant??"fill",e=>this._setStyle("button_variant",e))}
      </div>
      <div class="field">
        <div class="field-lbl">Size</div>
        ${this._pills([{value:"sm",label:"Small"},{value:"md",label:"Medium"},{value:"lg",label:"Large"}],t.button_size??"md",e=>this._setStyle("button_size",e))}
      </div>
      ${this._sliderRow("Tile corner radius",t.tile_radius??12,0,24,2,"px",e=>this._setStyle("tile_radius",e))}
    `,n=this._getAreas(),l=G`
      <div class="pill-grp" style="margin-bottom:12px">
        ${n.map(t=>{const s=!!e.area_styles?.[t.name],i=this._editingArea===t.name;return G`
            <span class="pill ${i?"on":""} ${s?"has-style":""}"
              @click=${()=>{this._editingArea=i?null:t.name}}>
              ${t.name}${s?" ●":""}
            </span>
          `})}
      </div>
      ${this._editingArea?this._renderAreaStyleEditor(this._editingArea):V}
    `;return G`
      ${this._section("presets","Theme Preset","◈","background:rgba(167,139,250,0.1);color:#a78bfa",i)}
      ${this._section("colors","Colors","◐","background:rgba(244,96,30,0.1);color:#f4601e",r)}
      ${this._section("typography","Typography","T","background:rgba(251,191,36,0.1);color:#fbbf24",a)}
      ${this._section("buttons","Buttons","⬭","background:rgba(74,222,128,0.1);color:#4ade80",o)}
      ${this._section("area-styles","Per-Room Styles","⌂","background:rgba(45,212,191,0.1);color:#2dd4bf",l,Object.keys(e.area_styles??{}).length?`${Object.keys(e.area_styles).length} styled`:void 0)}
    `}_renderAreaStyleEditor(e){const t=this._config,s=t.area_styles?.[e]??{},i=this._areaStyleTab[e]??"background",r=t=>{this._areaStyleTab={...this._areaStyleTab,[e]:t}},a=G`
      ${this._colorRow("Background colour",s.bgColor,"#1c1c1e",t=>this._setAreaStyle(e,"bgColor",t),()=>this._setAreaStyle(e,"bgColor",void 0))}
      <div class="field">
        <div class="field-lbl">Background image URL</div>
        <input type="text" .value=${s.bgImage??""} placeholder="/local/image.jpg"
          @change=${t=>this._setAreaStyle(e,"bgImage",t.target.value||void 0)}>
      </div>
    `,o=G`
      ${this._colorRow("Header colour 1",s.headerBgColor,"#1a1a2e",t=>this._setAreaStyle(e,"headerBgColor",t),()=>this._setAreaStyle(e,"headerBgColor",void 0))}
      ${this._colorRow("Header colour 2 (gradient)",s.headerBgColor2,"#0f3460",t=>this._setAreaStyle(e,"headerBgColor2",t),()=>this._setAreaStyle(e,"headerBgColor2",void 0))}
      ${this._colorRow("Room name colour",s.textColor,"#f4601e",t=>this._setAreaStyle(e,"textColor",t),()=>this._setAreaStyle(e,"textColor",void 0))}
      ${this._colorRow("Accent colour",s.accentColor,"#f4601e",t=>this._setAreaStyle(e,"accentColor",t),()=>this._setAreaStyle(e,"accentColor",void 0))}
    `,n=G`
      ${this._colorRow("Tile background",s.tileBgColor,"#1c1c1e",t=>this._setAreaStyle(e,"tileBgColor",t),()=>this._setAreaStyle(e,"tileBgColor",void 0))}
      ${this._colorRow("Tile border",s.tileBorderColor,"rgba(255,255,255,0.07)",t=>this._setAreaStyle(e,"tileBorderColor",t),()=>this._setAreaStyle(e,"tileBorderColor",void 0))}
      ${this._sliderRow("Tile corner radius",s.tileBorderRadius??12,0,20,2,"px",t=>this._setAreaStyle(e,"tileBorderRadius",t))}
      <div class="field">
        <div class="field-lbl">Shadow</div>
        ${this._pills([{value:"none",label:"None"},{value:"soft",label:"Soft"},{value:"medium",label:"Medium"},{value:"strong",label:"Strong"}],s.boxShadow??"none",t=>this._setAreaStyle(e,"boxShadow",t))}
      </div>
    `,l=G`
      <div class="field">
        <div class="field-lbl">Columns override</div>
        <div class="step-row">
          <button class="step-btn" @click=${()=>this._setAreaStyle(e,"columns",Math.max(1,(s.columns??3)-1))}>−</button>
          <span class="step-val">${s.columns??"—"}</span>
          <button class="step-btn" @click=${()=>this._setAreaStyle(e,"columns",Math.min(6,(s.columns??3)+1))}>+</button>
        </div>
      </div>
      ${this._sliderRow("Tile gap",s.tileGap??10,4,24,2,"px",t=>this._setAreaStyle(e,"tileGap",t))}
      ${this._sliderRow("Border width",s.borderWidth??1,0,8,1,"px",t=>this._setAreaStyle(e,"borderWidth",t))}
      ${this._colorRow("Section border colour",s.borderColor,"rgba(255,255,255,0.07)",t=>this._setAreaStyle(e,"borderColor",t),()=>this._setAreaStyle(e,"borderColor",void 0))}
    `;return G`
      <div class="area-editor">
        <div class="area-editor-hdr">
          <span class="area-editor-name">${e}</span>
          ${Object.keys(s).length?G`
            <button class="clear-btn" @click=${()=>this._clearAreaStyle(e)}>Clear all</button>
          `:V}
        </div>
        <div class="style-tabs">
          ${["background","header","tiles","layout"].map(e=>G`
            <button class="style-tab ${i===e?"active":""}"
              @click=${()=>r(e)}>${e[0].toUpperCase()+e.slice(1)}</button>
          `)}
        </div>
        <div class="style-tab-body">
          ${"background"===i?a:"header"===i?o:"tiles"===i?n:l}
        </div>
      </div>
    `}_renderGraphsTab(){const e=this._config,t=e.graph_style??{},s=e.graph_sensors??[],i=e.graph_sensor_colors??{},r=[...new Set(Ue.map(e=>e.group))],a=G`
      ${r.map(e=>{const t=Ue.filter(t=>t.group===e),r=t.every(e=>s.includes(e.key));return G`
          <div class="sensor-group">
            <div class="sg-hdr">
              <span class="sg-title">${e}</span>
              <button class="sg-all-btn" @click=${()=>this._toggleGroupSensors(e,"graph_sensors")}>
                ${r?"Deselect all":"Select all"}
              </button>
            </div>
            <div class="sensor-grid">
              ${t.map(e=>{const t=s.includes(e.key),r=i[e.key]??e.defaultColor;return G`
                  <div class="sensor-card ${t?"active":""}"
                    @click=${()=>this._toggleGraphSensor(e.key)}>
                    <div class="sensor-color-dot" style="background:${r}"></div>
                    <div class="sensor-info">
                      <div class="sensor-name">${e.label}</div>
                      <div class="sensor-unit">${e.unit}</div>
                    </div>
                    ${t?G`<span class="sensor-check">✓</span>`:V}
                  </div>
                `})}
            </div>
          </div>
        `})}
    `,o=G`
      <div class="field">
        <div class="field-lbl">Type</div>
        ${this._pills([{value:"line",label:"Line"},{value:"area",label:"Area"},{value:"bar",label:"Bar"}],t.type??"line",e=>this._setGraphStyle("type",e))}
      </div>
      ${this._sliderRow("Line thickness",t.line_width??1.5,.5,4,.5,"px",e=>this._setGraphStyle("line_width",e))}
      ${this._sliderRow("Graph height",t.height??32,20,80,4,"px",e=>this._setGraphStyle("height",e))}
      ${this._sliderRow("History window",e.graph_hours??24,1,168,1,"h",e=>this._set("graph_hours",e))}
      <div class="divider"></div>
      <div class="tog-row">
        <div><div class="tog-lbl">Fill under curve</div></div>
        <label class="sw"><input type="checkbox" .checked=${!1!==t.fill}
          @change=${e=>this._setGraphStyle("fill",e.target.checked)}>
          <span class="sw-track"></span><span class="sw-thumb"></span></label>
      </div>
      <div class="tog-row">
        <div><div class="tog-lbl">Peak / min dots</div></div>
        <label class="sw"><input type="checkbox" .checked=${!1!==t.show_dots}
          @change=${e=>this._setGraphStyle("show_dots",e.target.checked)}>
          <span class="sw-track"></span><span class="sw-thumb"></span></label>
      </div>
      <div class="tog-row">
        <div><div class="tog-lbl">Time axis labels</div></div>
        <label class="sw"><input type="checkbox" .checked=${!1!==t.time_labels}
          @change=${e=>this._setGraphStyle("time_labels",e.target.checked)}>
          <span class="sw-track"></span><span class="sw-thumb"></span></label>
      </div>
      <div class="tog-row">
        <div><div class="tog-lbl">Tick grid lines</div></div>
        <label class="sw"><input type="checkbox" .checked=${!1!==t.tick_lines}
          @change=${e=>this._setGraphStyle("tick_lines",e.target.checked)}>
          <span class="sw-track"></span><span class="sw-thumb"></span></label>
      </div>
    `,n=s.length?G`
          ${Ue.filter(e=>s.includes(e.key)).map(e=>{const t=i[e.key];return this._colorRow(e.label,t,e.defaultColor,t=>{const s={...i,[e.key]:t};this._set("graph_sensor_colors",s)},()=>{const t={...i};delete t[e.key],this._set("graph_sensor_colors",Object.keys(t).length?t:void 0)})})}
        `:G`<div class="empty-hint">Select sensors above to configure their line colours.</div>`;return G`
      ${this._section("graph-sensors","Sensors to graph","◈","background:rgba(74,158,255,0.1);color:#4a9eff",a,s.length?`${s.length} selected`:"None","background:rgba(74,158,255,0.1);color:#4a9eff")}
      ${this._section("graph-style","Graph style","∿","background:rgba(45,212,191,0.1);color:#2dd4bf",o)}
      ${this._section("graph-colors","Line colors","◐","background:rgba(244,96,30,0.1);color:#f4601e",n)}
    `}_renderSensorsTab(){const e=this._config.sensors??[];return G`
      ${Ke.map(t=>{const s=t.items.every(t=>e.includes(t.key)),i=t.items.filter(t=>e.includes(t.key)).length,r=G`
          <div class="sg-hdr" style="margin-bottom:8px">
            <span></span>
            <button class="sg-all-btn" @click=${()=>this._toggleGroupSensors(t.group,"sensors")}>
              ${s?"Deselect all":"Select all"}
            </button>
          </div>
          <div class="sensor-grid">
            ${t.items.map(t=>{const s=0===e.length||e.includes(t.key);return G`
                <div class="sensor-card ${s?"active":""}"
                  @click=${()=>this._toggleSensor(t.key)}>
                  <div class="sensor-info">
                    <div class="sensor-name">${t.label}</div>
                  </div>
                  ${s?G`<span class="sensor-check">✓</span>`:V}
                </div>
              `})}
          </div>
        `,a=i===t.items.length?"All":i?`${i}/${t.items.length}`:"None",o={Electrical:"rgba(74,158,255,0.1);color:#4a9eff",Environmental:"rgba(74,222,128,0.1);color:#4ade80",Device:"rgba(167,139,250,0.1);color:#a78bfa",Alerts:"rgba(239,68,68,0.1);color:#f87171"};return this._section(`sensors-${t.group}`,t.group,"Alerts"===t.group?"⚠":"◈",`background:${o[t.group]??"rgba(74,158,255,0.1);color:#4a9eff"}`,r,a,`background:${o[t.group]??"rgba(74,158,255,0.1);color:#4a9eff"}`)})}
    `}_renderYamlTab(){const e=this._buildYaml();return G`
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
        <span class="yaml-label">Generated config</span>
        <button class="btn-copy" @click=${async()=>{await navigator.clipboard.writeText(e);const t=this.renderRoot.querySelector(".btn-copy");t&&(t.textContent="Copied!",setTimeout(()=>{t.textContent="Copy"},1500))}}>Copy</button>
      </div>
      <div class="yaml-block">${this._highlightYaml(e)}</div>
    `}_buildYaml(){const e=this._config,t=["type: custom:ha-device-dashboard"];e.integrations?.length&&(t.push("integrations:"),e.integrations.forEach(e=>t.push(`  - ${e}`))),e.areas?.length&&(t.push("areas:"),e.areas.forEach(e=>t.push(`  - ${e}`))),e.include_entities&&t.push("include_entities: true"),!1===e.show_offline&&t.push("show_offline: false"),t.push(""),e.columns&&t.push(`columns: ${e.columns}`),e.view_mode&&t.push(`view_mode: ${e.view_mode}`),e.tile_size&&t.push(`tile_size: ${e.tile_size}`),e.sort_by&&t.push(`sort_by: ${e.sort_by}`),e.tile_layout?.length&&(t.push("tile_layout:"),e.tile_layout.forEach(e=>t.push(`  - ${e}`))),e.theme&&t.push(`\ntheme: ${e.theme}`);const s=e.style;s&&Object.keys(s).length&&(t.push("style:"),Object.entries(s).forEach(([e,s])=>t.push(`  ${e}: "${s}"`))),e.graph_sensors?.length&&(t.push("\ngraph_sensors:"),e.graph_sensors.forEach(e=>t.push(`  - ${e}`)));const i=e.graph_style;i&&Object.keys(i).length&&(t.push("graph_style:"),Object.entries(i).forEach(([e,s])=>t.push(`  ${e}: ${s}`))),e.graph_hours&&t.push(`graph_hours: ${e.graph_hours}`);const r=e.graph_sensor_colors;return r&&Object.keys(r).length&&(t.push("graph_sensor_colors:"),Object.entries(r).forEach(([e,s])=>t.push(`  ${e}: "${s}"`))),e.sensors?.length&&(t.push("\nsensors:"),e.sensors.forEach(e=>t.push(`  - ${e}`))),t.filter(e=>void 0!==e).join("\n")}_highlightYaml(e){const t=e.split("\n").map(e=>{if(e.startsWith("#"))return G`<span class="yc">${e}</span>\n`;const t=e.indexOf(":");if(t>0&&!e.trimStart().startsWith("-")){const s=e.slice(0,t),i=e.slice(t);return G`<span class="yk">${s}</span><span>${i}</span>\n`}if(e.trimStart().startsWith("- ")){const t=e.length-e.trimStart().length,s=e.trim().slice(2);return G`${" ".repeat(t)}<span>- </span><span class="ys">${s}</span>\n`}return G`${e}\n`});return G`${t}`}render(){if(!this._config)return G``;return G`
      <div class="editor">
        <div class="tab-nav">
          ${[{id:"devices",label:"Devices"},{id:"layout",label:"Layout"},{id:"style",label:"Style"},{id:"graphs",label:"Graphs"},{id:"sensors",label:"Sensors"},{id:"yaml",label:"YAML"}].map(e=>G`
            <div class="tab ${this._tab===e.id?"active":""}"
              @click=${()=>{this._tab=e.id}}>
              ${e.label}
            </div>
          `)}
        </div>

        <div class="tab-body">
          ${"devices"===this._tab?this._renderDevicesTab():V}
          ${"layout"===this._tab?this._renderLayoutTab():V}
          ${"style"===this._tab?this._renderStyleTab():V}
          ${"graphs"===this._tab?this._renderGraphsTab():V}
          ${"sensors"===this._tab?this._renderSensorsTab():V}
          ${"yaml"===this._tab?this._renderYamlTab():V}
        </div>
      </div>
    `}};et.styles=o`
    :host {
      --ed-bg:       var(--card-background-color, #17171c);
      --ed-surface:  var(--secondary-background-color, #1e1e26);
      --ed-surface3: rgba(255,255,255,0.06);
      --ed-border:   var(--divider-color, rgba(255,255,255,0.08));
      --ed-border2:  rgba(255,255,255,0.14);
      --ed-text:     var(--primary-text-color, #e2e2e8);
      --ed-text2:    var(--secondary-text-color, #888896);
      --ed-text3:    rgba(255,255,255,0.25);
      --ed-accent:   #f4601e;
      --ed-accentbg: rgba(244,96,30,0.10);
      --ed-accentbdr:rgba(244,96,30,0.28);
      --ed-rad:      8px;
      display: block;
    }

    .editor { font-family: var(--primary-font-family, 'DM Sans', sans-serif); }

    /* ── Tab nav ── */
    .tab-nav {
      display: flex; gap: 1px; padding: 6px 12px 0;
      border-bottom: 1px solid var(--ed-border); overflow-x: auto;
    }
    .tab {
      font-size: 10px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase;
      padding: 7px 12px; color: var(--ed-text3); cursor: pointer;
      border-bottom: 2px solid transparent; white-space: nowrap; transition: all 0.15s;
      border-radius: 5px 5px 0 0; user-select: none;
    }
    .tab:hover { color: var(--ed-text2); }
    .tab.active { color: var(--ed-accent); border-bottom-color: var(--ed-accent); }

    .tab-body { padding: 12px; }

    /* ── Section ── */
    .sec { border: 1px solid var(--ed-border); border-radius: 10px; overflow: hidden; margin-bottom: 7px; }
    .sec-hdr {
      display: flex; align-items: center; justify-content: space-between;
      padding: 9px 13px; cursor: pointer; user-select: none;
      background: var(--ed-surface); transition: filter 0.12s;
    }
    .sec-hdr:hover { filter: brightness(1.06); }
    .sec-hdr-l { display: flex; align-items: center; gap: 8px; }
    .sec-ico {
      width: 20px; height: 20px; border-radius: 4px;
      display: flex; align-items: center; justify-content: center; font-size: 10px; flex-shrink: 0;
    }
    .sec-title {
      font-size: 11px; font-weight: 700; letter-spacing: 0.05em;
      text-transform: uppercase; color: var(--ed-text);
    }
    .sec-hdr-r { display: flex; align-items: center; gap: 7px; }
    .sec-badge { font-size: 9px; font-weight: 700; padding: 2px 7px; border-radius: 10px; }
    .chev { font-size: 9px; color: var(--ed-text3); }
    .sec.open .chev { transform: rotate(180deg); }
    .sec-body { padding: 13px; border-top: 1px solid var(--ed-border); }

    /* ── Inputs ── */
    input[type="text"],
    input[type="number"] {
      width: 100%; background: var(--ed-surface); border: 1px solid var(--ed-border2);
      border-radius: var(--ed-rad); padding: 7px 10px;
      font-family: inherit; font-size: 12px; color: var(--ed-text); outline: none;
      transition: border-color 0.15s;
    }
    input[type="text"]:focus,
    input[type="number"]:focus { border-color: var(--ed-accent); }
    input[type="range"] { width: 100%; accent-color: var(--ed-accent); cursor: pointer; }

    /* ── Fields ── */
    .field { margin-bottom: 12px; }
    .field:last-child { margin-bottom: 0; }
    .field-lbl {
      font-size: 10px; font-weight: 700; letter-spacing: 0.05em;
      color: var(--ed-text2); text-transform: uppercase; margin-bottom: 7px;
    }
    .field-hint { font-size: 10px; color: var(--ed-text3); margin-top: 4px; }

    /* ── Toggle ── */
    .tog-row {
      display: flex; align-items: center; justify-content: space-between;
      padding: 7px 0; border-bottom: 1px solid var(--ed-border);
    }
    .tog-row:last-child { border-bottom: none; }
    .tog-lbl { font-size: 12px; color: var(--ed-text); }
    .tog-sub { font-size: 10px; color: var(--ed-text3); margin-top: 1px; }
    .sw { position: relative; width: 34px; height: 18px; flex-shrink: 0; }
    .sw input { opacity: 0; width: 0; height: 0; }
    .sw-track {
      position: absolute; inset: 0; background: var(--ed-surface3);
      border-radius: 9px; border: 1px solid var(--ed-border2);
      transition: background 0.2s, border-color 0.2s; cursor: pointer;
    }
    .sw-thumb {
      position: absolute; top: 2px; left: 2px; width: 12px; height: 12px;
      background: var(--ed-text3); border-radius: 50%;
      transition: transform 0.2s, background 0.2s; pointer-events: none;
    }
    .sw input:checked ~ .sw-track { background: var(--ed-accentbg); border-color: var(--ed-accentbdr); }
    .sw input:checked ~ .sw-thumb { transform: translateX(16px); background: var(--ed-accent); }

    /* ── Pills ── */
    .pill-grp { display: flex; flex-wrap: wrap; gap: 5px; }
    .pill {
      font-size: 10px; font-weight: 500; padding: 4px 10px;
      border-radius: 20px; border: 1px solid var(--ed-border2); color: var(--ed-text2);
      cursor: pointer; transition: all 0.12s; user-select: none; background: var(--ed-surface);
    }
    .pill:hover { border-color: var(--ed-accent); color: var(--ed-accent); }
    .pill.on { background: var(--ed-accentbg); border-color: var(--ed-accentbdr); color: var(--ed-accent); }
    .pill.has-style { border-color: rgba(251,191,36,0.4); color: #fbbf24; }

    /* ── Slider row ── */
    .sl-row { margin-bottom: 10px; }
    .sl-row:last-child { margin-bottom: 0; }
    .sl-label { font-size: 10px; font-weight: 700; letter-spacing: 0.04em; color: var(--ed-text2); text-transform: uppercase; margin-bottom: 5px; }
    .sl-accent { color: var(--ed-accent); font-weight: 500; }

    /* ── Color row ── */
    .col-row {
      display: flex; align-items: center; gap: 8px; padding: 6px 0;
      border-bottom: 1px solid var(--ed-border);
    }
    .col-row:last-child { border-bottom: none; }
    .col-swatch-wrap {
      width: 22px; height: 22px; border-radius: 4px;
      border: 1px solid var(--ed-border2); cursor: pointer; flex-shrink: 0;
      overflow: hidden; position: relative;
    }
    .col-dot { width: 100%; height: 100%; border-radius: 3px; }
    .col-swatch-wrap input[type="color"] {
      position: absolute; inset: -4px; width: calc(100%+8px); height: calc(100%+8px);
      cursor: pointer; border: none; padding: 0; background: none; opacity: 0;
    }
    .col-name { font-size: 12px; color: var(--ed-text); flex: 1; }
    .col-hex { font-size: 10px; color: var(--ed-text3); font-family: monospace; }
    .col-reset {
      background: none; border: none; color: var(--ed-text3); cursor: pointer;
      font-size: 12px; padding: 0 3px; transition: color 0.12s;
    }
    .col-reset:hover { color: var(--ed-accent); }

    /* ── Step buttons ── */
    .step-row { display: flex; align-items: center; gap: 6px; margin-bottom: 4px; }
    .step-btn {
      width: 26px; height: 26px; border: 1px solid var(--ed-border2); border-radius: var(--ed-rad);
      background: var(--ed-surface); color: var(--ed-text2); font-size: 15px; cursor: pointer;
      display: flex; align-items: center; justify-content: center; transition: all 0.12s;
    }
    .step-btn:hover { border-color: var(--ed-accent); color: var(--ed-accent); }
    .step-val { font-size: 13px; color: var(--ed-text); min-width: 24px; text-align: center; font-weight: 600; }

    /* ── Integration rows ── */
    .int-row {
      display: flex; align-items: center; gap: 9px; padding: 8px 0;
      border-bottom: 1px solid var(--ed-border);
    }
    .int-row:last-child { border-bottom: none; }
    .int-badge {
      font-size: 8px; font-weight: 700; padding: 2px 6px;
      border-radius: 3px; letter-spacing: 0.06em; flex-shrink: 0; min-width: 44px; text-align: center;
    }
    .int-name { font-size: 12px; color: var(--ed-text); flex: 1; }

    /* ── Room rows ── */
    .room-row {
      display: flex; align-items: center; gap: 8px; padding: 7px 0;
      border-bottom: 1px solid var(--ed-border);
    }
    .room-row:last-child { border-bottom: none; }
    .room-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
    .room-name { font-size: 12px; color: var(--ed-text); flex: 1; }
    .room-styled-badge {
      font-size: 9px; padding: 1px 5px; border-radius: 3px;
      background: rgba(251,191,36,0.1); color: #fbbf24;
      border: 1px solid rgba(251,191,36,0.3);
    }
    .room-style-btn {
      background: none; border: 1px solid var(--ed-border);
      border-radius: 5px; color: var(--ed-text3); font-size: 10px;
      padding: 3px 8px; cursor: pointer; transition: all 0.12s;
    }
    .room-style-btn:hover { border-color: var(--ed-accent); color: var(--ed-accent); }

    /* ── Search ── */
    .search-wrap {
      display: flex; align-items: center; gap: 6px; background: var(--ed-surface);
      border: 1px solid var(--ed-border2); border-radius: var(--ed-rad);
      padding: 6px 10px; margin-bottom: 10px;
    }
    .search-wrap input { background: none; border: none; outline: none; font-size: 12px; color: var(--ed-text); width: 100%; }
    .search-icon { font-size: 11px; color: var(--ed-text3); }

    /* ── Drag list ── */
    .drag-list { display: flex; flex-direction: column; gap: 4px; margin-bottom: 10px; }
    .drag-item {
      display: flex; align-items: center; gap: 9px; padding: 8px 11px;
      background: var(--ed-surface); border: 1px solid var(--ed-border);
      border-radius: var(--ed-rad); cursor: grab; transition: background 0.12s, border-color 0.12s;
      user-select: none;
    }
    .drag-item:hover { background: var(--ed-surface3); border-color: var(--ed-border2); }
    .drag-handle { display: flex; flex-direction: column; gap: 2px; color: var(--ed-text3); }
    .drag-handle span { display: block; width: 13px; height: 1.5px; background: currentColor; border-radius: 1px; }
    .drag-label { font-size: 11px; font-weight: 600; color: var(--ed-text); }
    .drag-sub { font-size: 10px; color: var(--ed-text3); margin-top: 1px; }

    /* ── Preview label ── */
    .preview-label { font-size: 9px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: var(--ed-text3); margin-bottom: 8px; }

    /* ── Reset btn ── */
    .reset-btn {
      background: none; border: 1px solid var(--ed-border);
      border-radius: 6px; color: var(--ed-text3); font-size: 11px;
      padding: 5px 12px; cursor: pointer; width: 100%; transition: all 0.12s;
    }
    .reset-btn:hover { border-color: var(--ed-accent); color: var(--ed-accent); }

    /* ── Theme presets ── */
    .preset-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 7px; margin-bottom: 6px; }
    .preset-card {
      border: 1px solid var(--ed-border); border-radius: var(--ed-rad);
      overflow: hidden; cursor: pointer; transition: border-color 0.15s; position: relative;
    }
    .preset-card:hover { border-color: var(--ed-border2); }
    .preset-card.active { border-color: var(--ed-accent); }
    .preset-card.active::after {
      content: '✓'; position: absolute; top: 5px; right: 5px;
      width: 14px; height: 14px; background: var(--ed-accent); border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 8px; color: white; line-height: 14px; text-align: center;
    }
    .preset-preview {
      height: 44px; padding: 8px; display: flex; align-items: flex-end; gap: 4px;
    }
    .preset-name {
      font-size: 9px; font-weight: 600; color: var(--ed-text2); padding: 5px 7px;
      background: var(--ed-surface); border-top: 1px solid var(--ed-border); text-align: center;
      letter-spacing: 0.03em;
    }
    .preset-card.active .preset-name { color: var(--ed-accent); }

    /* ── Font options ── */
    .font-opt {
      padding: 8px 10px; border: 1px solid var(--ed-border); border-radius: var(--ed-rad);
      cursor: pointer; margin-bottom: 5px; transition: all 0.12s;
    }
    .font-opt:last-child { margin-bottom: 0; }
    .font-opt:hover { border-color: var(--ed-border2); }
    .font-opt.active { border-color: var(--ed-accentbdr); background: var(--ed-accentbg); }
    .font-name { font-size: 11px; color: var(--ed-text); margin-bottom: 2px; }
    .font-sample { font-size: 11px; color: var(--ed-text3); }

    /* ── Button preview ── */
    .btn-preview {
      display: flex; align-items: center; gap: 8px; padding: 10px;
      background: var(--ed-surface); border: 1px solid var(--ed-border);
      border-radius: var(--ed-rad); margin-bottom: 12px;
    }

    /* ── Area style editor ── */
    .area-editor {
      background: var(--ed-surface); border: 1px solid var(--ed-border);
      border-radius: var(--ed-rad); padding: 12px; margin-top: 8px;
    }
    .area-editor-hdr {
      display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;
    }
    .area-editor-name { font-size: 13px; font-weight: 700; color: var(--ed-text); }
    .clear-btn {
      background: none; border: 1px solid rgba(239,68,68,0.4); border-radius: 5px;
      color: #f87171; font-size: 10px; padding: 3px 9px; cursor: pointer;
    }
    .clear-btn:hover { background: rgba(239,68,68,0.1); }
    .style-tabs { display: flex; gap: 4px; margin-bottom: 10px; }
    .style-tab {
      flex: 1; padding: 4px; border-radius: var(--ed-rad); font-size: 10px; font-weight: 600;
      text-align: center; cursor: pointer; border: 1px solid var(--ed-border);
      background: var(--ed-surface3); color: var(--ed-text2); transition: all 0.12s;
    }
    .style-tab.active { background: var(--ed-accentbg); border-color: var(--ed-accentbdr); color: var(--ed-accent); }

    /* ── Sensor selector ── */
    .sensor-group { margin-bottom: 14px; }
    .sensor-group:last-child { margin-bottom: 0; }
    .sg-hdr {
      display: flex; align-items: center; justify-content: space-between;
      padding: 4px 0; margin-bottom: 7px; border-bottom: 1px solid var(--ed-border);
    }
    .sg-title {
      font-size: 9px; font-weight: 700; letter-spacing: 0.06em;
      text-transform: uppercase; color: var(--ed-text3);
    }
    .sg-all-btn {
      background: none; border: none; font-size: 10px;
      color: var(--ed-text3); cursor: pointer; padding: 1px 4px; border-radius: 3px;
    }
    .sg-all-btn:hover { color: var(--ed-accent); }
    .sensor-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 5px; }
    .sensor-card {
      display: flex; align-items: center; gap: 7px; padding: 7px 9px;
      background: var(--ed-surface); border: 1px solid var(--ed-border);
      border-radius: var(--ed-rad); cursor: pointer; transition: all 0.12s; user-select: none;
      position: relative;
    }
    .sensor-card:hover { border-color: var(--ed-border2); }
    .sensor-card.active { border-color: var(--ed-accentbdr); background: var(--ed-accentbg); }
    .sensor-color-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
    .sensor-info { flex: 1; min-width: 0; }
    .sensor-name { font-size: 11px; font-weight: 500; color: var(--ed-text2); }
    .sensor-card.active .sensor-name { color: var(--ed-text); }
    .sensor-unit { font-size: 9px; color: var(--ed-text3); margin-top: 1px; font-family: monospace; }
    .sensor-check { position: absolute; top: 4px; right: 5px; font-size: 9px; color: var(--ed-accent); }

    /* ── Empty hint ── */
    .empty-hint { font-size: 11px; color: var(--ed-text3); padding: 4px 0; line-height: 1.5; }

    /* ── Divider ── */
    .divider { height: 1px; background: var(--ed-border); margin: 8px 0; }

    /* ── YAML tab ── */
    .yaml-label { font-size: 10px; color: var(--ed-text3); font-family: monospace; }
    .btn-copy {
      background: none; border: 1px solid var(--ed-border2); border-radius: 5px;
      color: var(--ed-text2); font-size: 10px; padding: 3px 10px; cursor: pointer; transition: all 0.12s;
    }
    .btn-copy:hover { color: var(--ed-accent); border-color: var(--ed-accentbdr); }
    .yaml-block {
      font-family: 'IBM Plex Mono', 'Consolas', monospace; font-size: 11px; line-height: 1.7;
      color: var(--ed-text2); background: var(--ed-surface); border: 1px solid var(--ed-border);
      border-radius: var(--ed-rad); padding: 10px 12px; overflow-x: auto; white-space: pre;
    }
    .yaml-block::-webkit-scrollbar { height: 4px; }
    .yaml-block::-webkit-scrollbar-thumb { background: var(--ed-surface3); border-radius: 2px; }
    .yk { color: #7dd3fc; }
    .yv { color: #86efac; }
    .ys { color: #fde68a; }
    .yn { color: #f9a8d4; }
    .yc { color: var(--ed-text3); }
  `,e([ue({attribute:!1})],et.prototype,"hass",void 0),e([be()],et.prototype,"_config",void 0),e([be()],et.prototype,"_tab",void 0),e([be()],et.prototype,"_openSections",void 0),e([be()],et.prototype,"_expandedRooms",void 0),e([be()],et.prototype,"_areaStyleTab",void 0),e([be()],et.prototype,"_editingArea",void 0),e([be()],et.prototype,"_dragSrc",void 0),e([be()],et.prototype,"_deviceSearch",void 0),et=e([pe("ha-device-dashboard-editor")],et),window.customCards=window.customCards||[],window.customCards.push({type:"ha-device-dashboard",name:"HA Device Dashboard",description:"Universal device fleet overview — Shelly, ZHA, Hue, ESPHome, Matter and more.",preview:!0,documentationURL:"https://github.com/TheIcelandicguy/ha-device-dashboard"});
