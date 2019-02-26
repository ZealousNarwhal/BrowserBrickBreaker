//#region Variables
var config = 
{
    type: Phaser.AUTO,
    width: 600,
    height: 600,
    backgroundColor: '#6495ED',

    physics:
    {
        default: 'arcade',
        arcade:{}
    },

    scene: 
    {
        preload: preload,
        create: create,
        update: update
    }
};

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

var game = new Phaser.Game(config);
var ball;
var player;
var bricks = [];
var livesText;
var announcementText;
var announcementSubText;

var isPaddleMovingLeft = false;
var isPaddleMovingRight = false;

var lives = 3;
var ballSpeed = 100;
var ballXMod = 1.0;
var isGameActive = true;

//#endregion

//#region Game Loop
function preload() 
{
   this.load.image('ball', 'assets/ball.png');
   this.load.image('paddle', 'assets/paddle.png')
   this.load.image('brick1', 'assets/brick1.png')
}

function create() 
{
    player = this.physics.add.sprite((game.config.width / 2), (game.config.height - 35), 'paddle');
    player.body.collideWorldBounds = true;
    player.body.immovable = true;

    ball = this.physics.add.sprite(((game.config.width / 2)), (game.config.height - 59), 'ball');
    ball.body.immovable = true;
    ball.setVelocity(ballSpeed, -ballSpeed);

    for(var x = 0; x < 8; x++)
    {
        for(var y = 0; y < 3; y++)
        {
            bricks.push(this.physics.add.sprite(32 + (64 * x) + (10 * (x  + 1)), 16 + (32 * y) + (10 * (y + 1)), 'brick1'));
            bricks[bricks.length - 1].body.immovable = true;
        }
    }

    livesText = this.add.text(5, config.height - 20, 'Lives: ' + lives);

    announcementText = this.add.text((config.width / 2), (config.height / 2), " ", //space is nessesary for subtext height
    { 
        font: '64px', 
        fill: '#ffffff', 
    });

    announcementSubText = this.add.text((config.width / 2), (config.height / 2) + announcementText.height, " ",
    { 
        font: '24px', 
        fill: '#ffffff', 
    });
}

function update() 
{
    if(isGameActive)
    {
        this.physics.add.collider(ball, player, ballCollision, processCallback, this);
        this.physics.add.collider(ball, bricks, ballCollision, processCallback, this);
        CheckWorldBounds();
    }
}

function keyDownHandler(e)
{
    if(e.key == 'r')
    {
        ResetGame();
    }

    if(isGameActive)
    {
        if(e.key == 'a')
        {
            isPaddleMovingLeft = true;
        }

        if(e.key == 'd')
        {
            isPaddleMovingRight = true;
        }

        UpdatePlayer();
    }
};

function keyUpHandler(e)
{
    if(e.key == 'a')
    {
        isPaddleMovingLeft = false;
    }

    if(e.key == 'd')
    {
        isPaddleMovingRight = false;
    }

    UpdatePlayer();
};

//#endregion

//#region Collision
function processCallback(ball, player)
{
    return true;
}

function  ballCollision(ball, obj)
{
    if(obj == player)
    {
        ball.body.y = player.body.y - ball.body.height;
        ballXMod = Math.random() + 0.5;
        ball.setVelocityY(-ballSpeed);
        ball.setVelocityX(ball.body.velocity.x * ballXMod)
    }

    if(bricks.includes(obj))
    {
        if(obj.body.touching.up)
        {
            ball.setVelocityY(-ballSpeed);
        }

        else if(obj.body.touching.down)
        {
            ball.setVelocityY(ballSpeed);
        }

        if(obj.body.touching.left)
        {
            ball.setVelocityX(-ballSpeed * ballXMod);
        }

        else if(obj.body.touching.right)
        {
            ball.setVelocityX(ballSpeed * ballXMod);
        }

        obj.exists = false;
        obj.visible = false;
        obj.body.enable = false;
    }
}
//#endregion

var UpdatePlayer = function()
{
    var dir = 0;

    if(isPaddleMovingLeft)
    {
        dir -= 1;
    }

    if(isPaddleMovingRight)
    {
        dir += 1;
    }

    player.setVelocityX(dir * 200);
};

var CheckWorldBounds = function()
{
    if(ball.body.x >= game.config.width - ball.body.width)
    {
        ball.setVelocityX(-ballSpeed * ballXMod);
    }

    else if(ball.body.x <= 0)
    {
        ball.setVelocityX(ballSpeed * ballXMod);
    }

    if(ball.body.y <= 0)
    {
        ball.setVelocityY(ballSpeed);
    }

    if(ball.body.y >= game.config.height - ball.body.height)
    {
        if(lives > 0)
        {
            UpdateLives(-1);
            ResetBall();
        }

        else
        {
            ball.body.setVelocity(0, 0);
            isGameActive = false;
            DisplayAnnouncement('Game Over', 'press "r" to reset.')
        }
    }
};

var UpdateLives = function(mod)
{
    lives += mod;
    livesText.text = 'Lives: ' + lives;
}

var ResetBall = function()
{
    player.x = (game.config.width / 2);
    ball.x = (game.config.width / 2);
    ball.y = (game.config.height - 59);
    ball.setVelocity(ballSpeed, -ballSpeed);
};

var ResetGame = function()
{
    ResetBall()
    DisplayAnnouncement(' ', ' ');
    isGameActive = true;
    UpdateLives(3 - lives);
    RestoreLevel();
}

var DisplayAnnouncement = function(mainText, subText)
{
    announcementText.text = mainText;
    announcementSubText.text = subText;

    announcementText.x -= (announcementText.width / 2);
    announcementSubText.x -= (announcementSubText.width / 2);
};

var RestoreLevel = function()
{
    for(var i = 0; i < bricks.length; i++)
    {
        bricks[i].exists = true;
        bricks[i].visible = true;
        bricks[i].body.enable = true;
    }
};