import type { Bi } from "@/lib/bi";

export type ProductFaq = { question: Bi; answer: Bi };

const t = (th: string, en: string): Bi => ({ th, en });
const faq = (
  qTh: string,
  qEn: string,
  aTh: string,
  aEn: string,
): ProductFaq => ({ question: t(qTh, qEn), answer: t(aTh, aEn) });

/**
 * Per-product questions shown on the product page, keyed by CatalogProduct.slug.
 * Written for dealers and project buyers. Numbers must match products-catalog.ts.
 */
export const PRODUCT_FAQS: Record<string, ProductFaq[]> = {
  "wood-blinds": [
    faq(
      "มู่ลี่ไม้ต่างจากมู่ลี่อลูมิเนียมอย่างไร?",
      "How do wooden blinds differ from aluminium blinds?",
      "มู่ลี่ไม้ให้โทนอบอุ่นและลายไม้ที่ดูเป็นงานออกแบบ ส่วนมู่ลี่อลูมิเนียมเบากว่า (ราว 0.7 กก./ตร.ม. เทียบกับ Basswood 1.86 กก./ตร.ม.) เช็ดทำความสะอาดง่ายกว่า เลือกไม้เมื่อเน้นบรรยากาศ เลือกอลูมิเนียมเมื่อเน้นดูแลง่าย",
      "Wooden blinds bring warmth and visible grain; aluminium is lighter (about 0.7 kg/m² against 1.86 kg/m² for basswood) and easier to wipe clean. Pick wood for atmosphere, aluminium for easy upkeep.",
    ),
    faq(
      "Basswood กับ Fauxwood เลือกอย่างไร?",
      "Basswood or fauxwood — which should I choose?",
      "Basswood เป็นไม้แท้ ให้ผิวและลายธรรมชาติ (16 สี) ส่วน Fauxwood เป็นไม้คอมโพสิต ทนความชื้นและความร้อนได้ดีกว่า เหมาะกับครัวและห้องน้ำ (32 สี)",
      "Basswood is real timber with a natural grain (16 colours). Fauxwood is a composite that handles humidity and heat better, suited to kitchens and bathrooms (32 colours).",
    ),
    faq(
      "ขนาดสูงสุดที่ผลิตได้เท่าไร?",
      "What is the maximum size?",
      "ความกว้างสูงสุด 300 ซม. ขนาดสูงสุด Basswood 150×400 ซม. และ Fauxwood 150×350 ซม. งานที่ใหญ่กว่านี้ปรึกษาทีมงานเรื่องการแบ่งชุด",
      "Maximum width is 300 cm; maximum size is 150×400 cm for basswood and 150×350 cm for fauxwood. For larger openings, talk to our team about splitting into sets.",
    ),
    faq(
      "ดูแลรักษาอย่างไร?",
      "How should they be cared for?",
      "เช็ดฝุ่นด้วยผ้าแห้งหรือไมโครไฟเบอร์เป็นประจำ หลีกเลี่ยงน้ำขังและไอน้ำโดยตรง โดยเฉพาะ Basswood และไม่ใช้สารเคมีรุนแรงกับผิวใบ",
      "Dust regularly with a dry or microfibre cloth. Keep them away from standing water and direct steam, especially basswood, and avoid harsh chemicals on the slats.",
    ),
    faq(
      "บังแสงได้สนิทแค่ไหน?",
      "How completely do they block light?",
      "ปรับองศาใบเพื่อบังแดดและคงวิวได้ละเอียด แต่ไม่ทึบสนิทเท่าม่านผ้า Blackout เพราะมีช่องแสงตามขอบบานและรูร้อยเชือก ถ้าต้องการมืดสนิทแนะนำม่านม้วนผ้า Blackout",
      "Tilt the slats to cut glare and keep the view, but they are not fully dark like a blackout fabric — light can pass at the edges and cord holes. For total darkness, choose a blackout roller.",
    ),
  ],

  "aluminium-blinds": [
    faq(
      "ใบ 25 มม. กับ 50 มม. เลือกอย่างไร?",
      "25 mm or 50 mm slats?",
      "ใบ 25 มม. ให้ลุคละเอียดและเป็นระเบียบ มี 38 สี ส่วนใบ 50 มม. ให้ลุคกว้างและทันสมัย มี 28 สี ทั้งสองขนาดใช้ได้กับงานสำนักงานและห้องน้ำ",
      "25 mm slats give a fine, tidy look in 38 colours; 50 mm slats look broader and more modern in 28 colours. Both suit offices and bathrooms.",
    ),
    faq(
      "L Shape กับ C Shape ต่างกันอย่างไร?",
      "What is the difference between L Shape and C Shape?",
      "L Shape ใบหักมุมรูปตัว L รูร้อยเชือกเล็ก ปิดแสงได้แนบกว่า ส่วน C Shape เป็นใบโค้งแบบดั้งเดิมสำหรับงานทั่วไป",
      "L Shape has L-angled slats with tiny cord holes for a tighter close. C Shape is the classic curved slat for everyday use.",
    ),
    faq(
      "ใช้ในห้องน้ำหรือครัวได้ไหม?",
      "Can they be used in bathrooms and kitchens?",
      "ได้ อลูมิเนียมทนความชื้นและเช็ดทำความสะอาดง่าย เหมาะกับห้องน้ำ ครัว และพื้นที่ที่ต้องทำความสะอาดบ่อย",
      "Yes. Aluminium tolerates humidity and wipes clean, which suits bathrooms, kitchens and other areas that need frequent cleaning.",
    ),
    faq(
      "ขนาดสูงสุดที่ผลิตได้เท่าไร?",
      "What is the maximum size?",
      "ความกว้างสูงสุด 270 ซม. ขนาดสูงสุด 150×450 ซม. พื้นที่สูงสุด 14.29 ตร.ม. หัวเกียร์โซ่วนรับน้ำหนักได้ไม่เกิน 10 กก.",
      "Maximum width is 270 cm, maximum size 150×450 cm and maximum area 14.29 m². The chain clutch carries up to 10 kg.",
    ),
    faq(
      "ทำความสะอาดอย่างไรไม่ให้ใบบิด?",
      "How do I clean them without bending the slats?",
      "เช็ดทีละใบด้วยผ้านุ่มหรือไมโครไฟเบอร์ ไม่บิดใบแรงเกินองศาที่ปรับได้ และไม่ราดน้ำที่กลไกหัวราง",
      "Wipe slat by slat with a soft or microfibre cloth. Don't force the slats past their tilt range, and keep water off the headrail mechanism.",
    ),
  ],

  "roller-blinds": [
    faq(
      "Sunscreen กับ Blackout ต่างกันอย่างไร?",
      "What is the difference between sunscreen and blackout fabric?",
      "Sunscreen (5% / 3% / 1%) กรองแสงและมองวิวได้ ตัวเลขยิ่งน้อยแสงผ่านยิ่งน้อย ส่วน Blackout และ Fiberglass เน้นลดแสงและเพิ่มความเป็นส่วนตัว เลือกตามทิศแดดและการใช้งานห้อง",
      "Sunscreen (5% / 3% / 1%) filters light while keeping the view — the lower the number, the less light passes. Blackout and fiberglass fabrics focus on blocking light and privacy. Choose by sun direction and room use.",
    ),
    faq(
      "มีรูปแบบม่านอะไรให้เลือกบ้าง?",
      "Which blind types are available?",
      "มีม่านม้วนธรรมดา, Zebra (แถบทึบสลับโปร่ง), Panel (แผงเลื่อนข้างสำหรับบานกว้างและประตูกระจก), Double Roll (ผ้าโปร่งคู่ผ้าทึบ) และ Roman Shade",
      "Standard roller, Zebra (alternating sheer and solid bands), Panel (sliding panels for wide windows and glass doors), Double Roll (sheer plus blackout) and Roman Shade.",
    ),
    faq(
      "ใช้ระบบโซ่หรือมอเตอร์ได้ไหม?",
      "Is it available with chain or motor?",
      "ได้ทั้งสองแบบ ระบบโซ่ใช้หัวเกียร์ 38 มม. รับน้ำหนัก 8 กก. ส่วนมอเตอร์ 38 มม. ติดตั้งภายในรางบน",
      "Both. The chain version uses a 38 mm clutch rated for 8 kg; the motor is a 38 mm unit fitted inside the headrail.",
    ),
    faq(
      "กันแสงรอบขอบได้ไหม?",
      "Can light leaking around the edges be stopped?",
      "เลือกเพิ่มรางข้างกันแสงได้ เพื่อลดแสงที่รั่วตามขอบผ้า เหมาะกับห้องที่ต้องการมืดมากขึ้น",
      "Yes — optional side channels reduce light leaking past the fabric edges, useful in rooms that need to be darker.",
    ),
    faq(
      "ทำความสะอาดอย่างไร?",
      "How do I clean it?",
      "เช็ดฝุ่นด้วยผ้าแห้งหรือไมโครไฟเบอร์ คราบจุดเช็ดเบาๆ ตามชนิดผ้า ไม่ราดน้ำทั้งผืนถ้าไม่ใช่ผ้าที่รองรับ",
      "Dust with a dry or microfibre cloth and spot-clean gently according to the fabric. Don't soak the whole blind unless the fabric allows it.",
    ),
  ],

  "vertical-blinds": [
    faq(
      "ม่านปรับแสงเหมาะกับหน้างานแบบไหน?",
      "Where do vertical blinds work best?",
      "เหมาะกับบานกว้าง ประตูกระจก และห้องในสำนักงาน เพราะหมุนใบเพื่อคุมทิศทางแสงและเลื่อนเปิดได้ทั้งแถว",
      "They suit wide windows, glass doors and offices: rotate the vanes to steer light and draw the whole row aside.",
    ),
    faq(
      "ตัดผ้าด้วย Ultra Sonic ดีกว่าอย่างไร?",
      "Why is ultrasonic cutting better?",
      "ขอบผ้าถูกตัดและผนึกในขั้นตอนเดียว ขอบเรียบ ไม่ลุ่ย และปิดแสงได้ดีกว่าการเย็บทั่วไป",
      "The edge is cut and sealed in one step, so it stays clean and doesn't fray, and it closes against light better than standard stitching.",
    ),
    faq(
      "ใช้กับหน้าต่างโค้งหรือเอียงได้ไหม?",
      "Can it fit curved or sloped openings?",
      "ได้ มีรางตรง รางตัดโค้ง และรางสโลป ควรแจ้งแบบหน้างานให้ทีมงานเลือกรางที่เหมาะ",
      "Yes — straight, curved and sloped tracks are available. Share the opening layout and our team will recommend the right track.",
    ),
    faq(
      "ชุดอะไหล่ Plastic Standard กับ Stainless Premium ต่างกันอย่างไร?",
      "Plastic Standard or Stainless Premium parts?",
      "Plastic Standard เหมาะงานทั่วไป ส่วน Stainless Premium เป็นเกรดที่แข็งแรงกว่า เหมาะกับงานที่ใช้งานหนักหรือเปิดปิดบ่อย",
      "Plastic Standard suits general use; Stainless Premium is the sturdier grade for heavy or frequent use.",
    ),
  ],

  "outdoor-roller": [
    faq(
      "ต่างจากม่านม้วนภายในอย่างไร?",
      "How is it different from an interior roller blind?",
      "ออกแบบสำหรับติดตั้งภายนอกอาคาร ใช้วัสดุที่รับแดดและฝนได้ ต่างจากม่านม้วนภายในที่ออกแบบสำหรับในอาคาร",
      "It is built for exterior installation with materials that cope with sun and rain, unlike interior roller blinds made for indoor use.",
    ),
    faq(
      "ใช้ระบบมือหมุนหรือมอเตอร์?",
      "Hand-crank or motor?",
      "มาตรฐานเป็นระบบมือหมุน และเปลี่ยนใส่มอเตอร์ได้ภายหลังเมื่อต้องการ",
      "Hand-crank as standard, with a motor upgrade available later.",
    ),
    faq(
      "พื้นที่ที่มีลมแรงควรเลือกรุ่นไหน?",
      "What if the site is windy?",
      "ถ้าหน้างานมีลมแรง แนะนำม่านซิปบลาย (Zip Blinds) เพราะขอบผ้าล็อกในรางข้างจึงตึงเรียบกว่า",
      "For windy sites we recommend Zip Blinds, where the fabric edges are locked in side channels and stay taut.",
    ),
    faq(
      "ดูแลอย่างไรให้ใช้ได้นาน?",
      "How do I make it last?",
      "ม้วนเก็บเมื่อมีพายุหรือลมแรง ล้างฝุ่นและคราบน้ำเป็นระยะ และไม่ฝืนดึงเมื่อผ้าเปียก",
      "Roll it up during storms or strong wind, rinse off dust and water marks regularly, and don't force it when the fabric is wet.",
    ),
  ],

  "zip-blinds": [
    faq(
      "ซิปบลายต่างจากม่านม้วนภายนอกทั่วไปอย่างไร?",
      "How do zip blinds differ from a standard outdoor roller?",
      "ขอบผ้าวิ่งในรางข้างตลอดแนว ผ้าจึงตึงเรียบแม้มีลม ลดช่องว่างด้านข้าง ต่างจากม่านม้วนภายนอกทั่วไปที่ขอบผ้าไม่ได้ล็อกราง",
      "The fabric edges run in full-height side channels, so the fabric stays taut in wind and side gaps are reduced. A standard outdoor roller has free edges.",
    ),
    faq(
      "โปรไฟล์ 50 มม. กับ 63 มม. เลือกอย่างไร?",
      "50 mm or 63 mm profile?",
      "โปรไฟล์ 50 มม. และ 63 มม. สำหรับขนาดมาตรฐาน ส่วนรุ่น 63 มม. สำหรับหน้างานขนาดใหญ่พิเศษ แจ้งขนาดหน้างานให้ทีมงานเลือกให้",
      "50 mm and 63 mm cover standard sizes, and the 63 mm option is for extra-large openings. Send us the opening size and we will choose.",
    ),
    faq(
      "ใช้ระบบอะไรในการเปิดปิด?",
      "How is it operated?",
      "เป็นระบบมอเตอร์ทั้งหมด เหมาะกับหน้างานภายนอกที่กว้างและสูง",
      "It is fully motorized, which suits wide and tall exterior openings.",
    ),
    faq(
      "ดูแลรางข้างอย่างไร?",
      "How should the side channels be maintained?",
      "ทำความสะอาดรางจากฝุ่นและทรายเป็นระยะ และไม่ฝืนดึงเมื่อมีสิ่งอุดตัน เพื่อให้ผ้าวิ่งลื่น",
      "Clear dust and grit from the channels regularly and don't force the blind if something is blocking it, so the fabric keeps running smoothly.",
    ),
  ],

  skylight: [
    faq(
      "ม่านสกายไลท์ใช้กับหน้างานแบบไหน?",
      "Where is the skylight blind used?",
      "ใช้กับหลังคากระจก เพอร์โกล่า และช่องแสงด้านบน เพื่อลดแสงจ้าและความร้อนจากด้านบน",
      "It is used on glass roofs, pergolas and skylights to cut glare and heat from above.",
    ),
    faq(
      "ระบบ FSS, FTS และ FCS เลือกอย่างไร?",
      "How do I choose between FSS, FTS and FCS?",
      "ทั้ง 3 ระบบเหมาะกับโครงสร้างและขนาดช่องแสงต่างกัน ส่งแบบหรือภาพหน้างานให้ทีมงาน แล้วทีมงานจะแนะนำระบบที่เหมาะ",
      "The three systems suit different structures and opening sizes. Send the plan or site photos and our team will recommend one.",
    ),
    faq(
      "ใช้มอเตอร์หรือมือดึง?",
      "Motorized or manual?",
      "เป็นระบบมอเตอร์ เพราะหน้างานอยู่ด้านบนและเข้าถึงยาก",
      "It is motorized, since skylight installations are overhead and hard to reach.",
    ),
    faq(
      "ต้องเตรียมข้อมูลอะไรเมื่อขอราคา?",
      "What do I send when requesting a quote?",
      "ขนาดช่องแสง (กว้าง×ยาว) มุมเอียงของหลังคา ชนิดโครงสร้างที่ยึดได้ และรูปหน้างาน",
      "Opening size (width × length), roof pitch, the structure it will fix to, and site photos.",
    ),
  ],

  "pvc-folding-door": [
    faq(
      "ฉากกั้นทั้ง 4 สไตล์ต่างกันอย่างไร?",
      "How do the four panel styles differ?",
      "Standard เป็นใบทึบเรียบ, Japanese มีช่องแผ่นลาย 7 ลายหรือแผ่นใส, USA มีแบบประกอบและแบบเจาะ, URO มีช่องกระจกใสหรือกระจกขุ่น",
      "Standard is solid and plain; Japanese has inserts in 7 patterns or clear; USA comes assembled or perforated; URO has clear or frosted glass panels.",
    ),
    faq(
      "ผลิตสูงสุดได้เท่าไร?",
      "What is the maximum height?",
      "สูงสุด 3.60 เมตร รางอะลูมิเนียมอัลลอย 6063 ผิว Anodize เคลือบ Powder Coating และดัดโค้งได้",
      "Up to 3.60 m. The track is 6063 aluminium alloy, anodised and powder-coated, and can be bent to curves.",
    ),
    faq(
      "ปิดแน่นแค่ไหน กั้นแอร์ได้ไหม?",
      "How tightly does it close — does it hold back air-conditioning?",
      "ปิดแน่นด้วยแม่เหล็กเทปเต็มความสูงใบฉาก ช่วยแบ่งโซนและลดการไหลของอากาศได้ แต่ไม่ใช่ผนังก่อสร้างถาวร จึงไม่กันเสียงหรืออากาศได้เท่าผนัง",
      "A full-height magnetic strip closes the door tight, which helps divide zones and limit airflow — but it is not a permanent wall, so it won't block sound or air like one.",
    ),
    faq(
      "ใช้กับรางโค้งหรือรางโรงพยาบาลได้ไหม?",
      "Does it work with curved and hospital tracks?",
      "ได้ ใช้ร่วมกับรางโค้งดัดมือและรางโรงพยาบาลของเราได้",
      "Yes, it works with our hand-bent and hospital tracks.",
    ),
    faq(
      "ทำความสะอาดอย่างไร?",
      "How do I clean it?",
      "เช็ดด้วยผ้านุ่มและน้ำยาอ่อน หลีกเลี่ยงของมีคมและตัวทำละลายแรงที่ทำลายผิว PVC และเก็บรางล่างให้พ้นฝุ่นเพื่อให้เลื่อนลื่น",
      "Wipe with a soft cloth and mild cleaner. Avoid sharp objects and strong solvents that damage PVC, and keep the bottom track free of dust so it glides.",
    ),
  ],
};

/** Shown on every product that has questions, as the closing "how do I order" answer. */
export const ORDER_FAQ: ProductFaq = faq(
  "สั่งซื้อหรือขอราคาได้อย่างไร?",
  "How do I order or ask for a price?",
  "ทักทีมขายทาง LINE พร้อมแจ้งสินค้า ขนาด และจำนวน ทีมงานจะแจ้งราคาและระยะเวลาผลิตให้ ราคาและเวลาขึ้นกับขนาด วัสดุ สี และระบบควบคุมที่เลือก",
  "Message our sales team on LINE with the product, size and quantity, and we will quote price and lead time. Both depend on size, material, colour and control system.",
);

export function getProductFaqs(slug: string): ProductFaq[] {
  const items = PRODUCT_FAQS[slug];
  return items?.length ? [...items, ORDER_FAQ] : [];
}
