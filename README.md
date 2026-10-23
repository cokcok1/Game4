# 動物森林・鬥獸棋 v2

兒童色彩主題、繁體中文、手機觸控鬥獸棋。
純 HTML / CSS / JavaScript；不需安裝套件、後端或 API 金鑰。
包含最新多步預判電腦：入門、進階、挑戰（預設最高難度）。

## 上傳 GitHub Pages

1. 解壓縮 ZIP。
2. 在 GitHub 建立一個 repository（例如 jungle-chess）。使用 GitHub 免費方案時可建立公開 repository。
3. 將解壓縮後的全部檔案上傳到 repository 根目錄。注意：index.html 要直接放在根目錄，不要放在另一層資料夾裡，也不要只上傳 ZIP。
4. 開啟 repository 的 Settings → Pages。
5. 在 Build and deployment 選 Deploy from a branch，選 main 分支與 / (root)，儲存。
6. 等候部署完成，使用 Pages 顯示的網站網址開啟遊戲。

不需要 build 指令，不需要 Sites 設定或登入 ChatGPT。
GitHub 網頁介面文字可能隨版本及語言設定有所不同。

## 檔案

- index.html：完整畫面、手機排版、規則與難度選單。
- game.js：雙人/電腦模式、操作、悔棋、棋局自動儲存。
- engine.js：共用棋規及多步搜尋引擎。
- ai-worker.js：電腦背景運算，與 engine.js 放在同一層。
- .nojekyll：供 GitHub Pages 直接提供靜態檔案。
- README.md：本說明。

## 玩法及功能

橙隊先行。點自己的動物，再點綠色圓點行棋；虛線框表示可吃子。
獅虎可跳河，但會被河內老鼠阻擋。只有鼠可下水；鼠可吃象，象不可吃鼠。
動物進入敵方陷阱後暫時失去力量。進入敵方獸穴，或令對方無棋可行即勝出。
連續 100 步無吃子為和局。
雙人同樂是同一裝置輪流操作，沒有網上連線對戰。

最高難度每步搜尋時間預算約 2.2 秒，實際搜尋深度視裝置與局面而定，並非固定八步或保證不會失誤。
棋局及難度存在目前裝置、目前瀏覽器；不會跨裝置同步。
動物使用系統 emoji，不同手機的圖案可能略有差異。

## 本機測試

建議經由 HTTP 開啟，避免直接雙擊 HTML 導致瀏覽器限制 Web Worker。
如電腦有 Python，在本資料夾執行：

    python -m http.server 8000

然後開啟 http://localhost:8000 。正式使用建議直接開啟 GitHub Pages 網址。

## 更新網站

替換改動過的檔案並提交到同一分支，等候 Pages 重新部署，再重新整理網頁。
保留四個程式檔案於同一層。不要只更新 index.html 而遺漏 JavaScript。
此版本未加入離線快取或 PWA 安裝功能。
