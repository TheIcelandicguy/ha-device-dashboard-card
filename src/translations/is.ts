/**
 * Íslenska — Icelandic.
 *
 * Keys are never translated, only values. `npm run test:card` checks this
 * catalogue against `en.ts` in both directions, so a key added to English
 * without a translation here fails rather than rendering blank.
 *
 * Two notes for whoever reviews this:
 *
 * - **Chip labels are abbreviated to fit.** They render inside a tile chip a
 *   few characters wide, so `chip.*` values are short forms (`Str.`, `Rafh.`,
 *   `Hreyf.`) rather than the full word. The full terms are used in the detail
 *   sheet and gauge labels, where there is room.
 * - **The electrical terms are the ones worth a second look** — `launafl`
 *   (reactive power), `aflstuðull` (power factor) and `sýndarafl` (apparent
 *   power) are correct technical Icelandic but rare enough in a home context
 *   that a different short form might read better on a tile.
 */

import type { Translations } from '../localize';

export const IS: Translations = {
  // ── Skynjaramerki (stytt: birtast í þröngum reit á flísinni) ──
  'chip.power': 'Afl',
  'chip.apparent_power': 'S.afl',
  'chip.reactive_power': 'L.afl',
  'chip.power_factor': 'Afls.',
  'chip.frequency': 'Tíðni',
  'chip.voltage': 'Spenna',
  'chip.current': 'Str.',
  'chip.temperature': 'Hiti',
  'chip.humidity': 'Raki',
  'chip.illuminance': 'Birta',
  'chip.gas': 'Gas',
  'chip.battery': 'Rafh.',
  'chip.rssi': 'Wi-Fi',
  'chip.uptime': 'Uppi',
  'chip.motion': 'Hreyf.',
  'chip.door': 'Hurð',
  'chip.flood': 'Vatn',
  'chip.smoke': 'Reykur',
  'chip.vibration': 'Titr.',
  'chip.overtemp': 'Ofhiti',
  'chip.overpower': 'Ofálag',
  'chip.cloud': 'Ský',
  'chip.ethernet': 'Ethernet',
  'chip.valve': 'Loki',
  'chip.battery_short': 'Rafh.',

  // ── Tvíundarstöður ──
  'state.clear': 'Í lagi',
  'state.ok': 'Í lagi',
  'state.open': 'Opið',
  'state.closed': 'Lokað',
  'state.dry': 'Þurrt',
  'state.motion': 'Hreyfing',
  'state.flooded': 'Vatn!',
  'state.smoke': 'Reykur!',
  'state.gas': 'Gas!',
  'state.vibrating': 'Titrar',
  'state.overtemp': 'Ofhiti!',
  'state.overpower': 'Ofálag!',
  'state.connected': 'Tengt',
  'state.offline': 'Ótengt',

  // ── Hreyfing hlera og loka ──
  'state.opening': 'Opnast…',
  'state.closing': 'Lokast…',
  'state.partial': 'Að hluta',

  // ── Spilari ──
  'media.playing': 'Spilar',
  'media.paused': 'Í hléi',
  'media.idle': 'Bið',
  'media.unavailable': 'Ótiltækt',
  'media.off': 'Slökkt',
  'media.default_group': 'Efni',
  'media.station': 'Stöð…',
  'media.loading': 'Hleð…',

  // ── Orkutímabil ──
  'energy.total': 'Orka',
  'energy.today': 'Í dag',
  'energy.week': 'Vika',
  'energy.month': 'Mánuður',

  // ── Afstæður tími ──
  'time.never': 'Aldrei',
  'time.just_now': 'Rétt í þessu',
  'time.minutes_ago': 'fyrir {n} mín',
  'time.hours_ago': 'fyrir {n} klst',
  'time.days_ago': 'fyrir {n} d',

  // ── Haus, herbergi, yfirlit ──
  'header.favourites': 'Eftirlæti',
  'header.no_area': 'Ekkert svæði',
  'header.needs_attention': 'Þarfnast athygli',
  'header.expand_all': 'Opna allt',
  'header.collapse_all': 'Loka öllu',
  'header.expand_every_room': 'Opna öll herbergi',
  'header.collapse_every_room': 'Loka öllum herbergjum',
  'header.firmware': 'Fastbúnaður',
  'header.firmware_versions': '{n} fastbúnaðarútgáfur',
  'header.firmware_mixed': '{n} samþættingar með ólíkar útgáfur',
  'firmware.which': 'Sýna {n} tæki á þessari útgáfu',
  'header.newest': 'nýjast',

  // ── Aðgerðir ──
  'action.turn_on': 'Kveikja',
  'action.turn_off': 'Slökkva',
  'action.cancel': 'Hætta við',
  'action.open': 'Opna',
  'action.close': 'Loka',
  'action.play': 'Spila',
  'action.pause': 'Hlé',
  'action.mute': 'Þagga',
  'action.unmute': 'Afþagga',
  'action.install': 'Setja upp',
  'action.show_history': 'Sýna sögu',
  'action.dismiss': 'Loka',
  'action.heat': 'HITA',
  'action.off': 'SLÖKKT',

  // ── Staðfesting áður en slökkt er ──
  'confirm.aria': 'Staðfesta slökkvun',
  'confirm.title': 'Slökkva á {name}?',
  'confirm.body': 'Þetta tæki er stillt á að spyrja áður en slökkt er.',

  // ── Merkingar á flísum ──
  'tile.brightness': 'Birtustig',
  'tile.color_temp': 'Hiti',
  'tile.white': 'Hvítt',
  'tile.valve': 'Loki',
  'tile.press': 'Ýting',
  'tile.idle': 'Bið',

  // ── Mælaborð aflflísar ──
  'pm.power': 'Afl',
  'pm.voltage': 'Spenna',
  'pm.current': 'Straumur',
  'pm.temperature': 'Hiti',
  'pm.rssi': 'WiFi',
  'pm.uptime': 'Keyrslutími',
  'pm.energy': 'Orka',

  // ── Spilarahnappar og fleiri merkingar ──
  'action.previous': 'Fyrra',
  'action.stop': 'Stöðva',
  'action.next': 'Næsta',
  'media.no_favourites': 'Engin eftirlæti — stjörnumerktu stöðvar á skjánum',
  'media.volume': 'Hljóðstyrkur {n}%',
  'state.on_short': 'Á',
  'state.off_short': 'AF',
  'tile.now': 'Núna',
  'tile.set': 'Stillt',
  'tile.heating': 'Hitar',

  'pm.watts': 'vött',
  'state.active': 'virkt',
  'state.idle_low': 'óvirkt',
  'detail.valve_pos': 'Loki: {n}%',
  'detail.signal': 'Wi-Fi: {quality} ({dbm} dBm)',
  'detail.uptime_inline': 'Uppi {value}',

  // Tegundarmerki á flísinni. Lyklar fylgja DeviceProfile í types.ts.
  'profile.relay': 'Liði',
  'profile.plug': 'Tengill',
  'profile.dimmer': 'Deyfir',
  'profile.rgb': 'RGB',
  'profile.climate': 'Ofnloki',
  'profile.cover': 'Hleri',
  'profile.valve': 'Loki',
  'profile.lock': 'Lás',
  'profile.media': 'Spilari',
  'profile.energy': 'Orka',
  'profile.sensor': 'Skynjari',
  'profile.input': 'Inntak',
  'profile.uni': 'UNI',
  'profile.wall_display': 'Skjár',

  // Fyrirsagnir á línuritsröðum. Lyklar fylgja device_class í HA.
  'graph.power': 'Afl',
  'graph.voltage': 'Spenna',
  'graph.current': 'Straumur',
  'graph.energy': 'Orka',
  'graph.apparent_power': 'Sýndarafl',
  'graph.reactive_power': 'Launafl',
  'graph.frequency': 'Tíðni',
  'graph.power_factor': 'Aflstuðull',
  'graph.temperature': 'Hitastig',
  'graph.humidity': 'Raki',
  'graph.illuminance': 'Birta',
  'graph.carbon_dioxide': 'CO₂',
  'graph.gas': 'Gas',
  'graph.battery': 'Rafhlaða',
  'graph.signal_strength': 'RSSI',

  // ── Þegar ekkert er að sýna ──
  'empty.no_climate': 'Engin hitastýring',
  'empty.no_cover': 'Enginn hleri',
  'empty.no_valve': 'Enginn loki',
  'empty.no_light': 'Ekkert ljós',
  'empty.no_sensor': 'Enginn skynjari',
  'empty.no_inputs': 'Engar inntaksrásir',
  'empty.no_gauge_readings': 'Engar mælingar',

  // ── Nánar-spjaldið ──
  'detail.all_entities': 'Allar einingar',
  'detail.configuration': 'Stillingar',
  'detail.diagnostic': 'Greining',
  'detail.diagnostics': 'Greiningar',
  'detail.sensors': 'Skynjarar',
  'detail.alerts': 'Viðvaranir',
  'detail.rssi': 'RSSI',
  'detail.uptime': 'Keyrslutími',
  'detail.firmware': 'Fastbúnaður',
  'detail.relay_channels': 'Liðarásir',
  'detail.light_controls': 'Ljósastýringar',
  'detail.input_channels': 'Inntaksrásir',
  'detail.adc_inputs': 'ADC inntök',
  'detail.outputs': 'Úttök',
  'detail.controls': 'Stýringar',
  'detail.climate': 'Hitastýring',
  'detail.cover': 'Hleri',
  'detail.valve': 'Loki',
  'detail.brightness': 'Birtustig',
  'detail.sensor_current': 'Straumur',
  'detail.sensor_power': 'Afl',
  'detail.sensor_voltage': 'Spenna',
  'detail.sensor_temp': 'Hiti',
  'detail.climate_current': 'Núna',
  'detail.fw_update': 'Uppfærsla: {from} → {to}',
  'detail.install_now': 'Setja upp {version} núna',

  // ── Forskoðun í kortavalinu ──
  'picker.title': 'HA Device Dashboard',
  'picker.subtitle': 'Bættu kortinu við til að stilla herbergi og tæki',

  // ── Tilkynning um innbyggðar stýringar ──
  'notice.native_controls': 'Innbyggðar stýringar',
  'notice.delegate_one': '{n} tæki er með auka stýringar (vifta, ryksuga, lás…). Kveiktu á',
  'notice.delegate_many': '{n} tæki eru með auka stýringar (vifta, ryksuga, lás…). Kveiktu á',
  'notice.delegate_here': 'til að sýna þær.',
  'notice.delegate_editor': 'í ritlinum til að sýna þær.',
  'notice.discovery_shelly': '{n} tæki til viðbótar eru í Home Assistant en ekki á þessu korti — það er í Shelly-ham.',
  'notice.discovery_hidden': '{n} tæki eru ekki sýnd:',
  'notice.hidden_integration': '{n} vegna samþættingar',
  'notice.hidden_scope': '{n} vegna umfangs',
  'notice.hidden_domain': '{n} vegna léns',
  'notice.discovery_link': 'Uppgötvun',
  'notice.discovery_here': 'geymir stillingarnar.',
  'notice.discovery_editor': 'í ritlinum geymir stillingarnar.',
  'attention.mute': 'Hætta að telja þessa samþættingu',
  'attention.unmute': 'Telja þessa samþættingu aftur',
  'attention.muted': 'Ekki talið',

  // ── Villur ──
  'error.replay_needs_admin':
    'Endurtekning á ýtingu krefst stjórnandaaðgangs — Home Assistant hafnaði viðburðinum',
};
