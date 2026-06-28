metadata:
  name: أول-10-دقائق-مع-العامل
  description: الدرس الثالث — عملي: شغّل عاملك الأول في 10 دقائق
  module: 1
  level: beginner
  language: ar
  locale: DZ
  when_to_use: "درس عملي — المطلوب تفعيل العامل فعليًا"
  version: '1.0'
---

# ⏱️ أول 10 دقائق مع عاملك

## الهدف
تشغيل عامل حقيقي في الـ Agentic OS وفهم كل خطوة

---

## 📋 المتطلبات

- Windows (أنت عليه ✅)
- Git Bash (مثبت ✅)
- VS Code أو أي محرر
- الـ Agentic OS موجودة في الـ workspace ✅

---

## 🚀 الخطوة 1: افتح الـ Terminal

```bash
# اذهب إلى الـ workspace
cd Desktop/open-workspace
```

---

## 🚀 الخطوة 2: شغّل الـ venv

```bash
# على Windows — شغّل البيئة الافتراضية
./.meta/.venv/meta_run.ps1 .meta/engine/verify_boot.py
```

**ماذا يفعل هذا؟**
- يشغّل البيئة الافتراضية (venv)
- يفحص كل ملفات الـ OS
- يتأكد أن كل شيء يعمل

**النتيجة المتوقعة:**
```
✅ Boot verification passed
✅ All identity files loaded
✅ Daemon health: active
```

---

## 🚀 الخطوة 3: اقرأ حالة الـ System

```bash
# اقرأ ملف CONTROLER.yaml
cat CONTROLER.yaml
```

**ما الذي تراه؟**
- `system_modes` — حالة النظام
- `pipelines` — خطوط الأنابيب
- `metadata` — معلومات عامة

---

## 🚀 الخطوة 4: شغّل الـ Dashboard

```bash
# شغّل الـ daemon
./.meta/.venv/meta_run.ps1 .meta/engine/boot.py
```

**ماذا يحدث؟**
- الـ daemon يبدأ
- يستمع على port 8000
- يبدأ المزامنة التلقائية

---

## 🚀 الخطوة 5: أرسل أول رسالة

الآن افتح المحادثة (Telegram أو أي platform) واكتب للعامل:

> "مرحبًا، عرّف نفسك"

**العامل يجب أن يرد بـ:**
- اسمه
- دوره
- القوانين التي يتبعها

---

## ✅ خلاصة

| الخطوة | الأمر | النتيجة |
|---|---|---|
| 1 | `cd workspace` | دخلت المجلد |
| 2 | `verify_boot.py` | تأكدت أن النظام يعمل |
| 3 | `cat CONTROLER.yaml` | قرأت الحالة |
| 4 | `boot.py` | شغلت الـ daemon |
| 5 | "مرحبًا" | تحدث العامل! |

---

## 📝 تمارين

1. شغّل الـ verify_boot وشاركنا النتيجة
2. ماذا يوجد في مجلد `meta_identity/01_architecture/`؟
3. ما الفرق بين `boot.py` و `verify_boot.py`؟
