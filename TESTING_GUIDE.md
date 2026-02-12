# 🧪 COMPREHENSIVE TESTING GUIDE

## ✅ **BRUSH ALIGNMENT TEST**

### Test 1: Basic Drawing at 100% Zoom
1. Open index.html
2. Create room as DM
3. Open DM Panel
4. Click "✏️ Pen" tool
5. Draw on main canvas
6. **EXPECTED**: Brush draws EXACTLY where cursor is
7. **CHECK**: No offset, perfectly aligned

### Test 2: Drawing at Different Zoom Levels
1. Set zoom to 50% (slider to 50)
2. Draw with pen tool
3. **EXPECTED**: Still perfectly aligned
4. Set zoom to 200%
5. Draw with pen tool
6. **EXPECTED**: Still perfectly aligned

### Test 3: Drawing After Panning
1. Middle-click and drag to pan the view
2. Draw with pen tool
3. **EXPECTED**: Brush follows cursor perfectly
4. Pan again
5. Draw more
6. **EXPECTED**: Still perfect alignment

---

## 🗺️ **IMPORT TO GRID TEST**

### Test 1: Basic Import
1. Open DM Panel
2. Find "Map Builder" section
3. Draw something on the small canvas (you should see it drawing)
4. Click "Import to Grid" button
5. **EXPECTED**: 
   - Popup says "Map Imported!"
   - Drawing appears on main canvas in current cell
   - Map Builder canvas clears
   - Minimap updates showing filled cell

### Test 2: Import to Different Cells
1. Draw on Map Builder
2. Import to Grid
3. Navigate to different cell (use grid nav buttons)
4. Draw different thing on Map Builder
5. Import to Grid
6. **EXPECTED**: 
   - Each cell has different drawing
   - Both visible on main canvas
   - Minimap shows both cells filled

### Test 3: Import with Empty Canvas
1. Clear Map Builder (if it has content)
2. Click "Import to Grid" WITHOUT drawing anything
3. **EXPECTED**: 
   - Alert: "Map canvas is empty!"
   - Nothing imported
   - No crash

---

## 🔄 **SESSION PERSISTENCE TEST**

### Test 1: Solo DM Rejoin
1. Create room as DM
2. **COPY YOUR ROOM CODE** (very important!)
3. Draw several things on different grid cells
4. Place a token
5. Zoom to 150%
6. Pan the view a bit
7. **REFRESH THE PAGE** (F5 or Ctrl+R)
8. Click "Rejoin Session (DM)"
9. Enter: `Wizard` / `FracturedSky2025!`
10. Paste your **EXACT Room Code**
11. Click "Rejoin My Session"

**EXPECTED RESULTS:**
- ✅ Alert: "Session Rejoined Successfully!"
- ✅ Room Code is THE SAME (not a new one!)
- ✅ All your drawings are back
- ✅ Token is in same position
- ✅ Zoom is still at 150%
- ✅ Pan position restored
- ✅ **Console shows**: "Successfully reconnected with ID: [your code]"
- ✅ **Console shows**: "Game state restoration complete!"

### Test 2: With Player Connected
1. Create room as DM, save Room Code
2. Open SECOND browser tab (or use friend's computer)
3. Join as player with the Room Code
4. DM approves player
5. Place some tokens together
6. **DM REFRESHES BROWSER**
7. DM rejoins with same Room Code
8. **EXPECTED**:
   - ✅ DM reconnects with SAME Room Code
   - ✅ Player sees DM reconnect
   - ✅ Tokens still on board
   - ✅ Game continues

### Test 3: 30 Minute Timeout
1. Create room, save Room Code
2. Build map
3. Close browser tab
4. Wait 5 minutes (get coffee)
5. Open browser, rejoin with Room Code
6. **EXPECTED**: Still works! (30 min timeout)
7. Wait 31 minutes
8. Try to rejoin
9. **EXPECTED**: "Session expired" message

---

## 🐛 **TROUBLESHOOTING**

### If Brush is Still Off:
1. Open browser console (F12)
2. Look for: `[VTT DEBUG]` messages
3. When you click to draw, you should see:
   - Mouse coordinates
   - World coordinates
   - Cell being drawn to
4. Take screenshot and send to me!

### If Import Doesn't Work:
1. Check console for errors
2. Make sure Map Builder canvas is showing
3. Try drawing more prominently (bigger strokes)
4. Check if you see "✅ Map imported successfully" in console

### If Session Rejoin Fails:
1. Check console for errors
2. Look for: "Successfully reconnected with ID:"
3. If you see "unavailable-id", close other tabs
4. Make sure you're pasting the EXACT code
5. Try waiting 30 seconds and retry

---

## 📊 **CONSOLE LOGS TO LOOK FOR**

### Successful Session Rejoin:
```
[VTT DEBUG] 🔄 Attempting to rejoin session: abc123xyz
[VTT DEBUG] ✅ Successfully reconnected with ID: abc123xyz
[VTT DEBUG] 🔄 Restoring game state...
[VTT DEBUG] Loaded grid cell 0,0 (1/3)
[VTT DEBUG] ✅ Game state restoration complete!
  - Grid cells: 3
  - Placed tokens: 2
  - Images: 1
💾 Session saved
```

### Successful Import:
```
Importing map to grid cell: 0,0
✅ Map imported successfully to cell 0,0
```

### Successful Drawing:
```
[VTT DEBUG] Drawing at world coords: 150.5, 230.2
[VTT DEBUG] Drawing on cell: 0,0
```

---

## ✅ **VERIFICATION CHECKLIST**

After testing, verify:

- [ ] Brush draws exactly where cursor is at 100% zoom
- [ ] Brush stays aligned at 50% zoom
- [ ] Brush stays aligned at 200% zoom
- [ ] Brush works correctly after panning
- [ ] Import to Grid creates popup message
- [ ] Imported drawing appears on main canvas
- [ ] Imported drawing is in correct cell
- [ ] Map Builder clears after import
- [ ] Minimap updates after import
- [ ] DM can rejoin with same Room Code
- [ ] Room Code stays THE SAME after rejoin
- [ ] All drawings restore after rejoin
- [ ] Zoom level restores after rejoin
- [ ] Pan position restores after rejoin
- [ ] Console shows "Successfully reconnected"
- [ ] Console shows "Game state restoration complete"
- [ ] No console errors during any operations

---

**If ALL checkboxes pass: PERFECT! 🎉**

**If ANY fail: Send me the console logs and describe what happened!**
