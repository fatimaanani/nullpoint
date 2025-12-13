# NullPoint

NullPoint is a web application that allows users to share thoughts, interact with others through reactions and comments, and privately log diary entries using a mood-based journal system.

## Features

NullPoint features by page  
(all pages have a topbar that shows the name of the page we’re on)

**1. StillSpace:**  
i. Feed that displays posts from users (posts that were created in the Cast page and submitted).  
ii. Posts are displayed as cards with the day of creation, the name of the user, or **“Anonymous User”** if the anonymous button was clicked when writing the post in the Cast page, and the content of the post. Each post has 2 engagement options:  
1) reactions through emojis (like, thumbs up, etc.) using an emoji keyboard that opens when clicking the icon  
2) comments; the comments icon is clickable and displays the comments under the post. You can reply to comments, and if there are more than 5 comments, there is a “see more” option that expands them by 5 each time. There is also an **Add Comment** button that opens a box (text area with kaomoji keyboard, a button to add images with a limit of 3 images, a submit button, and a cancel button). Clicking outside the box also closes it.  
iii. On the corner of each post card, there are 3 dots. When clicked, the options are: **Report**, **Don’t show post**, and **Cancel**.  
iv. Posts can be filtered in 2 ways:  
1) recent (by date)  
2) trending (by highest number of engagements such as reactions and comments). The feed is scrollable.  
v. Currently, there is no limit on the number of characters in a post.  
vi. Posts cannot be empty.  
vii. You can see comments on other users’ posts and reply to them and react to them, but you cannot see who reacted or how many reactions were made on comments.

**2. Cast:**  
i. A scrollable text area to create a post.  
ii. You can add emojis, kaomojis, and pictures (limit of 3 images) through clickable buttons that open emoji/kaomoji keyboards and the file explorer for images.  
iii. There is an **anonymous button** that can be toggled before submitting a post so the user’s name does not show in StillSpace. This option is post-specific, meaning a user can have both anonymous and non-anonymous posts.  
iv. A **Submit Thought** button that, when clicked, stores the post in the database and displays it in StillSpace.  
v. The post cannot be empty.

**3. Journal:**  
i. A “Dear Diary” letter-shaped journal where the user writes the entry, with scrolling inside the letter itself.  
ii. Mood tags that can be clicked and change color, with a button to add custom tags.  
iii. The entry is stored under the tags that were selected while writing (used later in the profile and journal log).  
iv. Under the tags, there is a random quote that changes on refresh (currently static, later stored in a database table).  
v. A **Submit Entry** button at the end of the letter that saves the entry and sends it to the Journal Log.  
vi. The Journal Log is accessed through a button at the end of the Journal page.

**4. Journal Log:**  
i. A back arrow next to the page name in the topbar that routes back to the Journal page.  
ii. Logs are displayed in a calendar as square shapes with pastel colors. If there is one entry on a day, it is green by default; if there are multiple entries, the colors are randomly selected from a predefined pastel array.  
iii. Entries can be viewed by clicking on the day or the square itself, and all entries for that day are displayed.  
iv. Each entry is displayed with a title as a header, the selected mood tags, and the content of the diary. Long entries can be expanded using a **Read more** option without opening a new page.

**5. Profile (authentication related):**  
i. A logo on top taken from the Lucide library.  
ii. Gender selection with male, female, and a plain circle for **prefer not to say**.  
iii. Gender can only be selected once and cannot be changed later.  
iv. A user information box that displays the username and email entered during sign-up/sign-in.  
v. An **About** section where the user can write about themselves; a **Save Changes** button appears every time the text area is edited.  
vi. A **Most Used Moods** section that retrieves from the database the 4 most used journal tags and displays them as pills (not clickable).  
vii. A **Thoughts History** section that displays the history of posts created by the user.  
viii. Only the 3 most recent posts are displayed as cards with date and content, along with a **See all** button that routes to another page.  
ix. Posts are displayed only on the profile page.

**6. Thoughts History (See All page):**  
i. Displays all posts created by the user as cards with date and post content.  
ii. Users can interact with their own posts:  
– View emoji reactions by clicking the reaction icon (shown as a small box under it).  
– View all comments on the post.  
– Reply to comments and react to them.

