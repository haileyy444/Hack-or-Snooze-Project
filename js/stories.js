"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;


/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  
  console.log("Current user in getStarHTML:", currentUser);
  console.log("User instance check:", currentUser instanceof User);

  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();
  
  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story, showDeleteBtn = false) {
  console.debug("generateStoryMarkup", story);
 
  const hostName = story.getHostName();
  const showStar = Boolean(currentUser); // do they have favs?

  return $(`
      <li id="${story.storyId}">
        <div>
        ${showStar ? getStarHTML(story, currentUser) : ""}
        ${showDeleteBtn ? getDeleteBtnHTML() : ""}
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <div class="story-author">by ${story.author}</div>
        <div class="story-user">posted by ${story.username}</div>
        </div>
      </li>
    `);
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.log("putStoriesOnPage");
  
  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }
  $trendingStoriesHeader.show();
  $allStoriesList.show();
  
}

// when user submits newStoryForm, gets data from form, calls .addStory and applies to list
async function submitNewPost(evt) {
  console.log("SubmitNewPostClick", evt);
  evt.preventDefault();
  // $newPostForm.hide();

  // const $newPostSubmitBtn = $("#newPostSubmitBtn");
  const author = $("#author-name").val();
  const title = $("#title-name").val();
  const url = $("#url-input").val(); 
  const username = currentUser.username;
  const storyData = { title, url, author, username };

  console.log("title " + title + " Author: "+ author)
  try{
   const story = await storyList.addStory(currentUser, storyData);
    const $story = generateStoryMarkup(story);
    $allStoriesList.prepend($story);

    author.val("");
    title.val("");
    url.val("");
    console.log("Form Submitted");

    $("#newPostSubmitBtn").slideUp("slow");
    $("#newPostSubmitBtn").trigger("reset");
  }
  catch(error) {
    console.log("Error submitting form" + error);
  }
  
}

$("#newPostSubmitBtn").on("click", submitNewPost);

function putUserStoriesOnPage() {
  console.log("user stories print");
  $ownStories.empty();

  if (currentUser.ownStories.length === 0) {
    $ownStories.append("<h5> No Posts </h5> <br> <h6>Create a New Post</h6>");
  }
  else {
    for (let story of currentUser.ownStories) {
      let $story = generateStoryMarkup(story, true);
      $ownStories.append($story);
    }
  }
  $myStoriesHeader.show();
  $ownStories.show();
}

// Deleting stories
function getDeleteBtnHTML() {
  return `
      <span class="trash">
          <i class = "fas fa-trash-alt"></i>
      <span>`;
}

async function deleteStory(evt){
  console.debug("deleteStoryFunction");

  const $closestLi = $(evt.target).closest("Li");
  const storyId = $closestLi.attr("id");

  await storyList.removeStory(currentUser, storyId);
  await printUserStory();
}
$ownStories.on("click", ".trash", deleteStory);

//favorites



  //star html  that displays the star as either starred or not next to post
  function getStarHTML(story, user) {
    const isFavorite = user.isFavorite(story);
    const starType = isFavorite ? "fas" : "far";
    return `
      <span class = "star"> 
          <i class="${starType} fa-star"> </i>
      </span>`;
  }

  //allows for star to be clicked and become/not become favorited
  async function toggleStoryFavorite(event){
    console.log("Favorite");

    const $star = $(event.target);
    const $closestLi = $star.closest("li");
    const storyId = $closestLi.attr("id");
    const story = storyList.stories.find(star => star.storyId === storyId);
    
    if($star.hasClass("fas")) {
      $star.closest("i").toggleClass("fas far");
      await currentUser.removeFavorite(story); //removeFavorite function
    }
    else {
      $star.closest("i").toggleClass("fas far");
      await currentUser.addFavorite(story); //addFavorite function
    }  
  }
  $storiesLists.on("click", ".star", toggleStoryFavorite);

  

  //print favoites list
  function putFavoritesListOnPage() {
    console.log("print favorites list");
    $favoritesHeader,show();
    $favoritedStories.empty();
    if(currentUser.favorites.length === 0){
      $favoritedStories.append("<h5>No Favorites added</h5>");

    }
    else {
      for(let story of currentUser.favorites) {
        const $story = generateStoryMarkup(story);
        $favoritedStories.append($story); 
      }
    }
    $favoritedStories.show();
  }