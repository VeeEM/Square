Square.init(480, 640);
// http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
(function()
{
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x)
    {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelRequestAnimationFrame = window[vendors[x]+'CancelRequestAnimationFrame'];
    }
    if (!window.requestAnimationFrame)
    {
        var f = function(callback, element)
        {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16-(currTime-lastTime));
            var id = window.setTimeout(function()
            {
                callback(currTime+timeToCall);
            }, timeToCall);
            lastTime = currTime+timeToCall;
            return id;
        };
        window.requestAnimationFrame = f;
    }
    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id)
    {
        clearTimeout(id);
    };
}());
(function gameloop()
{
    Square.update();
    requestAnimationFrame(gameloop);
	Square.draw();
})();
