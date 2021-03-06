var atworktoday = angular.module('atworktoday', ['ngSanitize']);
io.sails.autoConnect = false;

atworktoday.controller('main', ['$scope', '$http', '$sce',
    function($scope, $http, $sce){

        $scope.posts = [];
        var day = new Date();
        var d = day.getDate();
        day = day.getFullYear()+"-"+(day.getMonth()+1)+"-"+day.getDate();

        $scope.trustSrc = function(src) {
    	    return $sce.trustAsResourceUrl(src);
    	}

        $scope.ga = function(type, action, label){
            ga('send','event', type, action, label);
        };

        $http.get('http://atworktoday.postpogo.com/Feed/feedstart?type=all&approved=0&limit=100000&sort=1&searchdate='+day).success(function(response){

            for(var i in response.posts){
                if(new Date(response.posts[i].postdate).getDate() == d){
                    if(response.posts[i].type == "twitter"){
                        response.posts[i].data.text = minEmoji(response.posts[i].data.text);
                    } else if(response.posts[i].type == "instagram"){
                        if(typeof(response.posts[i].data.caption) != "undefined" && response.posts[i].data.caption != null){
                            response.posts[i].data.caption.text = minEmoji(response.posts[i].data.caption.text);
                        }
                    }
                    $('.loader').hide();
                    $('.posts').show();
                    $scope.posts.push(response.posts[i]);

                }
            }
        });

        io.socket = io.sails.connect('http://atworktoday.postpogo.com:80');

        io.socket.on('connect', function(){
            console.log('connected');
            console.log(io.socket);
            
        });
        io.socket.on('newpost', function(response){
            if(response.post.type == "twitter"){
                response.post.data.text = minEmoji(response.post.data.text);
            } else if(response.post.type == "instagram"){
                if(typeof(response.post.data.caption) != "undefined" && response.post.data.caption != null){
                    response.post.data.caption.text = minEmoji(response.post.data.caption.text);
                }
            }
            $scope.posts.unshift(response.post);
            $scope.$apply();
        });
    }
]);


(function($, window){
    var tipsShown = [];
    $(document.body).on('click', 'a.tooltip', function(e){
        e.preventDefault();
        $('div.tooltip').hide();

        var tip = $(this).parent().find('div.tooltip').first();

        var close = tip.find('a.close');
        if(close.length == 0){
            tip.append('<a href="#" class="close">close</a>');
        }

        if($(this).hasClass('arrow')){
            var arrow = tip.find('.arr');
            if(arrow.length == 0){
                tip.append('<img src="/images/tooltip-arrow.png" class="arr" />');
            }
            tip.addClass('arrow');
        }

        if($(window).width() < 642){
            var cloned = tip.clone();
            cloned.addClass('cloned');
            tipsShown.push(cloned);
            $('body').append(cloned);

            cloned.css('top', document.body.scrollTop);
            cloned.css('position', 'absolute');
            cloned.show().transition({x:'-100%'});
        } else {
            if($(this).hasClass('bottomrow')){
                var rowset = tip.parent().parent().parent();
                var top = rowset.height();
                if($(this).hasClass('padded')){
                    top = top+8;
                }
                tip.css('top', top);
            } else if($(this).hasClass('arrow')){

                var top = 12;

                if($(this).hasClass('padded')){
                    top = top+8;
                }
                tip.css('top', top);
                tip.css('position', 'relative');
            }

            tip.slideToggle();
        }
    });

    $(document.body).on('click', 'div.tooltip a.close', function(e){
        e.preventDefault();
        if($(window).width() < 642){
            if(tipsShown.length)
            {
                var cloned = tipsShown.pop();
                cloned.transition({x:0, complete:function(){
                    $(this).empty().remove();
                }});
            } else {
                $(this).parent().slideToggle(function(){
                    $(this).css('top', '0');
                    $(this).removeClass('arrow');
                    $('div.tooltip.cloned').empty().remove();
                    tipsShown = [];
                });
            }
            if(tipsShown.length){
                tipsShown[tipsShown.length-1].show().transition({x:'-100%'});
            }
        } else {
            $(this).parent().slideToggle(function(){
                $(this).css('top', '0');
                $(this).removeClass('arrow');
                if($(this).hasClass('cloned')){
                    $(this).empty().remove();
                    $('div.tooltip.cloned').empty().remove();
                    tipsShown = [];
                }
            });
        }

    });
})(jQuery, window);
