tell application "Google Chrome"
    set windowList to every window
    set windowCount to 1
    repeat with theWindow in windowList
        set tabList to ""
        set tabItems to every tab of theWindow
        repeat with theTab in tabItems
            set tabList to tabList & URL of theTab & "\n"
        end repeat
        do shell script "echo " & quoted form of tabList & " > ~/Desktop/chrome_tabs_" & windowCount & ".txt"
        set windowCount to windowCount + 1
    end repeat
end tell
