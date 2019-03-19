var baseUrl = "https://www.reddit.com/r/drunkorakid/.json?sort=new";
var voteUrl = "https://amidrunkorakid.firebaseio.com/votes/";
var stack = [];
var afterId;
var currentId;

var getPosts = function(){
    var url = (afterId == null)? baseUrl : baseUrl + "&after=" + afterId;
    $.get(url, function(obj){
        var posts = obj.data.children;
        afterId = obj.data.after;

        posts.forEach(function(d){
            if(d.data.stickied === true) return true;
            stack.push({
                id: d.data.id,
                title: d.data.title,
                text: d.data.selftext,
                raw: d.data
            });
        });
        renderPost();
    }, "JSON");
};

var voteFor = function(vote){ 
    var url = voteUrl + currentId + "/" + vote + ".json";
    $.post(url, '{"vote": true}', function(){
        $('button#'+vote).addClass('button-primary');
        $('#choices button').attr('disabled', 'disabled');
        $('#explain-wrapper').addClass("show");
        getStats(vote);
    });
}

var getStats = function(voted){
    var url = voteUrl + currentId + ".json";
    $.get(url, "", function(data){
        var tally = [];
        tally['drunk'] = (typeof data['drunk'] == "undefined")? 0 : Object.keys(data['drunk']).length;
        tally['kid'] = (typeof data['kid'] == "undefined")? 0 : Object.keys(data['kid']).length;
        tally['total'] = tally['drunk'] + tally['kid'];
        tally['percent'] = (tally[voted]/tally['total'] * 100).toFixed(2) + '%';
        
        $('#results').css('width', tally['percent']);
        $('#results-wrapper').addClass('show');
        $('#results-wrapper span').html(tally['percent'] + ' of people guessed ' + voted);
        
    }, "json");  
};
        
var renderPost = function(){
    if(stack.length <= 0){
        getPosts();
        return;
    }
    var post = stack.shift();
    
    currentId = post.id;
    $('#question').html(post.title);
    $('#explain').html(post.text);
};

var nextPost = function(){
    renderPost();
    $('#choices button').removeClass('button-primary').attr('disabled', false);
    $('#explain-wrapper').removeClass("show");
    $('#results-wrapper').removeClass("show");
}

getPosts();
