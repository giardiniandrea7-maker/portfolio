---
name: pptx-validation
description: Regole e validazione per generazione/modifica PPTX con python-pptx. Garantisce nessuna sovrapposizione tra elementi, tutto dentro i bordi della slide, formattazione corretta. Attivare quando si lavora con PowerPoint, python-pptx, o generazione di presentazioni.
---

# PPTX Validation Skill

## 1. Workflow obbligatorio
1. **Analisi shape esistenti**: prima di aggiungere nuovi elementi, leggere posizione e dimensione di TUTTI gli shape sulla slide target
2. **Calcolo posizioni**: posizionare i nuovi elementi in base allo spazio libero, evitando sovrapposizioni
3. **Generazione**: creare gli shape con posizioni calcolate
4. **Validazione**: eseguire la funzione `validate_slide()` su ogni slide modificata PRIMA di salvare
5. **Salvataggio**: solo se la validazione passa

## 2. Funzione di validazione

Includere questa funzione in ogni script PPTX e chiamarla prima di `prs.save()`:

```python
def validate_slide(slide, slide_width, slide_height, slide_idx=0):
    """Verifica no-overlap e bounds per tutti gli shape di una slide."""
    issues = []
    shapes = list(slide.shapes)

    for i, shape in enumerate(shapes):
        if shape.left < 0:
            issues.append(f"Shape '{shape.name}' left ({shape.left}) < 0")
        if shape.top < 0:
            issues.append(f"Shape '{shape.name}' top ({shape.top}) < 0")
        if shape.left + shape.width > slide_width:
            issues.append(f"Shape '{shape.name}' right edge > slide width")
        if shape.top + shape.height > slide_height:
            issues.append(f"Shape '{shape.name}' bottom edge > slide height")

    for i in range(len(shapes)):
        for j in range(i + 1, len(shapes)):
            s1, s2 = shapes[i], shapes[j]
            l1, t1, r1, b1 = s1.left, s1.top, s1.left + s1.width, s1.top + s1.height
            l2, t2, r2, b2 = s2.left, s2.top, s2.left + s2.width, s2.top + s2.height
            if l1 < r2 and r1 > l2 and t1 < b2 and b1 > t2:
                issues.append(f"OVERLAP: '{s1.name}' e '{s2.name}' si sovrappongono")

    if issues:
        print(f"SLIDE {slide_idx + 1} - PROBLEMI TROVATI:")
        for issue in issues:
            print(f"  - {issue}")
        return False
    return True
```

## 3. Calcolo Y disponibile + margine

```python
def find_available_y(slide, margin_top=Inches(0.15)):
    """Trova la Y piu bassa occupata + margine sicuro."""
    max_bottom = 0
    for shape in slide.shapes:
        bottom = shape.top + shape.height
        if bottom > max_bottom:
            max_bottom = bottom
    return max_bottom + margin_top
```

**Regola pratica**: con slide 16:9, non superare **6-7 elementi verticali** nella zona contenuto. Se servono di più, dividere in 2 slide.

## 4. Convenzioni di formattazione

- **Content box**: `shape.fill.background()` (trasparente)
- **Bordi caselle**: `shape.line.no_fill = True`
- **Testo**: sempre `para.clear()` poi `para.add_run()` (mai scrivere su `run.text` esistenti)
- **Font default**: Calibri, 14-16pt per contenuto, 11-12pt per diagrammi

## 5. I/O su percorsi OneDrive

I percorsi OneDrive con spazi e parentesi causano errori. Copiare in temp prima di leggere/scrivere.
