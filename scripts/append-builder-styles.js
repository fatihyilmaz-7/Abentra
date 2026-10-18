const fs = require('fs');

const builderStyles = `
/* ==============================================================================
   EXECUTIVE WEB BUILDER & SECTION STUDIO STYLES
   ============================================================================== */

/* SMTP Locked Button State */
.smtp-locked {
  opacity: 0.45 !important;
  filter: grayscale(0.9) !important;
  cursor: not-allowed !important;
  position: relative !important;
  pointer-events: auto !important;
}
.smtp-locked:hover {
  transform: none !important;
  box-shadow: none !important;
}

/* Builder Main Layout */
.builder-studio-root {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
}

.builder-top-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  padding: 12px 18px;
  background: var(--fill);
  border: 1px solid var(--bd);
  border-radius: var(--rs);
}

.builder-mode-switcher {
  display: flex;
  gap: 6px;
  background: rgba(0, 0, 0, 0.25);
  padding: 4px;
  border-radius: var(--rp);
  border: 1px solid var(--ln);
}

.builder-mode-btn {
  all: unset;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  border-radius: var(--rp);
  font-size: 12.5px;
  font-weight: 500;
  color: var(--mut);
  transition: all .2s;
}

.builder-mode-btn:hover {
  color: var(--ink);
}

.builder-mode-btn.on {
  background: linear-gradient(135deg, color-mix(in srgb, var(--ac) 28%, transparent), transparent);
  border: 1px solid var(--ac);
  color: var(--ac);
  font-weight: 600;
  box-shadow: 0 0 12px rgba(224, 184, 90, 0.2);
}

.device-preview-bar {
  display: flex;
  gap: 4px;
  background: rgba(0, 0, 0, 0.25);
  padding: 4px;
  border-radius: var(--rp);
  border: 1px solid var(--ln);
}

.device-btn {
  all: unset;
  cursor: pointer;
  padding: 6px 12px;
  border-radius: var(--rp);
  font-size: 13px;
  color: var(--mut);
  transition: all .2s;
}

.device-btn:hover {
  color: var(--ink);
}

.device-btn.on {
  background: var(--fill);
  color: var(--ink);
  border: 1px solid var(--bd);
}

/* 2-Column Visual Builder Canvas Grid */
.builder-canvas-layout {
  display: grid;
  grid-template-columns: 340px 1fr;
  gap: 18px;
  align-items: start;
}

@media (max-width: 1024px) {
  .builder-canvas-layout {
    grid-template-columns: 1fr;
  }
}

/* Left Palette */
.builder-palette {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: calc(100vh - 210px);
  overflow-y: auto;
  position: sticky;
  top: 10px;
}

.widget-search-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: var(--fill);
  border: 1px solid var(--bd);
  border-radius: var(--rs);
}

.widget-search-wrap input {
  all: unset;
  flex: 1;
  font-size: 12.5px;
  color: var(--ink);
}

.widget-cat-tabs {
  display: flex;
  gap: 6px;
  overflow-x: auto;
  padding-bottom: 4px;
  scrollbar-width: none;
}

.widget-cat-pill {
  all: unset;
  cursor: pointer;
  white-space: nowrap;
  padding: 4px 10px;
  font-size: 11px;
  font-weight: 500;
  border-radius: var(--rp);
  background: var(--fill);
  border: 1px solid var(--ln);
  color: var(--mut);
  transition: all .2s;
}

.widget-cat-pill.on, .widget-cat-pill:hover {
  color: var(--ink);
  border-color: var(--ac);
  background: color-mix(in srgb, var(--ac) 15%, transparent);
}

.widget-stream-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.widget-lib-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--ln);
  border-radius: var(--rs);
  cursor: grab;
  transition: all .2s;
  user-select: none;
}

.widget-lib-card:hover {
  background: var(--fill);
  border-color: var(--ac);
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.3);
}

.widget-lib-card:active {
  cursor: grabbing;
}

.widget-icon-box {
  width: 36px;
  height: 36px;
  border-radius: var(--rs);
  background: linear-gradient(135deg, color-mix(in srgb, var(--ac) 20%, transparent), rgba(255,255,255,0.02));
  border: 1px solid color-mix(in srgb, var(--ac) 35%, transparent);
  color: var(--ac);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  flex-shrink: 0;
}

.widget-info-box {
  flex: 1;
  min-width: 0;
}

.widget-info-box b {
  display: block;
  font-size: 13px;
  color: var(--ink);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.widget-info-box small {
  font-size: 11px;
  color: var(--mut);
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.widget-add-btn {
  all: unset;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: var(--rp);
  font-size: 11px;
  color: var(--ac);
  border: 1px solid color-mix(in srgb, var(--ac) 40%, transparent);
  transition: all .2s;
}

.widget-add-btn:hover {
  background: var(--ac);
  color: #0b1a33;
}

/* Canvas Drop Zone */
.builder-canvas-wrapper {
  background: rgba(0, 0, 0, 0.35);
  border: 1px solid var(--bd);
  border-radius: var(--rs);
  padding: 16px;
  min-height: 520px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition: max-width .3s ease;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
}

.builder-canvas-wrapper.preview-tablet {
  max-width: 768px;
}

.builder-canvas-wrapper.preview-mobile {
  max-width: 420px;
}

.canvas-section-node {
  background: var(--card);
  border: 1px solid var(--bd);
  border-radius: var(--rs);
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  position: relative;
  transition: all .2s;
  box-shadow: 0 4px 12px rgba(0,0,0,0.25);
}

.canvas-section-node.dragging {
  opacity: 0.4;
  border-style: dashed;
  border-color: var(--ac);
}

.canvas-section-node.drag-over {
  border-color: var(--ac);
  box-shadow: 0 0 16px rgba(224, 184, 90, 0.4);
}

.section-node-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  cursor: grab;
}

.section-drag-handle {
  color: var(--mut);
  cursor: grab;
  font-size: 14px;
  padding: 2px 4px;
}

.section-drag-handle:active {
  cursor: grabbing;
}

.section-node-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  min-width: 0;
}

.section-node-meta b {
  font-size: 14px;
  color: var(--ink);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.section-node-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-node-body-preview {
  padding: 10px 12px;
  background: var(--fill);
  border-radius: var(--rs);
  border: 1px solid var(--ln);
  font-size: 12px;
  color: var(--mut);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

/* Detailed Structured List View */
.builder-list-wrapper {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.builder-list-item-card {
  background: var(--card);
  border: 1px solid var(--bd);
  border-radius: var(--rs);
  overflow: hidden;
  transition: border-color .2s;
}

.builder-list-item-card:hover {
  border-color: color-mix(in srgb, var(--ac) 40%, var(--bd));
}

.builder-list-card-head {
  padding: 14px 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.02);
}

.builder-list-card-body {
  padding: 18px;
  border-top: 1px solid var(--ln);
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: rgba(0, 0, 0, 0.2);
}

.builder-child-items-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 8px;
}

.builder-child-item-row {
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: 10px;
  align-items: center;
  padding: 10px;
  background: var(--fill);
  border: 1px solid var(--ln);
  border-radius: var(--rs);
}

@media (max-width: 768px) {
  .builder-child-item-row {
    grid-template-columns: 1fr;
  }
}

/* Section Edit Modal Overlay */
.builder-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(14px);
  display: none;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
  box-sizing: border-box;
}

.builder-modal-overlay.active {
  display: flex;
}

.builder-modal-card {
  background: #081122;
  border: 1px solid var(--ac);
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.75);
  border-radius: 14px;
  max-width: 720px;
  width: 100%;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.builder-modal-head {
  padding: 16px 20px;
  border-bottom: 1px solid var(--ln);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.builder-modal-body {
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.builder-modal-foot {
  padding: 14px 20px;
  border-top: 1px solid var(--ln);
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  background: rgba(0, 0, 0, 0.25);
}
`;

fs.appendFileSync('moon/manager/css/admin.css', builderStyles, 'utf8');
console.log('Successfully appended builder styles to moon/manager/css/admin.css!');
