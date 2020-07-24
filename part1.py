import random
import math
import pygame

pygame.init()
# creat the screen
screen = pygame.display.set_mode((800, 600))
# Title and icon

pygame.display.set_caption("Rock Rollers")
icony = pygame.image.load('landslide.png')
pygame.display.set_icon(icony)

playerImg = pygame.image.load('spaceship.png')
playerX = 370
playerY = 535
playerX_change = 0
playerY_change = 0
enyImg = []
enyX = []
enyY = []
enyxc = []
enyyc = []
no_of_enymies = 4
for i in range(no_of_enymies):
    enyImg.append(pygame.image.load('rhino.png'))
    enyX.append(random.randint(0, 765))
    enyY.append(random.randint(32, 400))
    enyxc.append(0.2)
    enyyc.append(50)

bulImg = pygame.image.load('bullet.png')
bulX = 0
bulY = 535
bulXc = 0
bulYc = 7
bul_state = "ready"
exImg = pygame.image.load('explosion.png')
exX = 370
exY = 535
score = 0
font = pygame.font.Font('freesansbold.ttf',32)
tx = 10
ty = 10

def set_score(x,y):
    sco = font.render(" Your score is  : " + str(score),True,(255,255,255))
    screen.blit(sco, (x, y))
def coll(a, b, c, d):
    dis = math.sqrt((math.pow(a - c, 2)) + (math.pow(b - d, 2)))

    if dis < 27:
        return True
    else:
        return False


def player(x, y):
    screen.blit(playerImg, (x, y))


def exp(x, y):
    screen.blit(exImg, (x, y))


def eny(x, y,i):
    screen.blit(enyImg[i], (x, y))


def bull(x, y):
    global bul_state
    bul_state = "fire"
    screen.blit(bulImg, (x + 20, y + 10))


# Game Loop
running = True
while running:
    screen.fill((0, 0, 102))
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False
        if event.type == pygame.KEYDOWN:
            if event.key == pygame.K_LEFT:
                playerX_change -= 2
            if event.key == pygame.K_RIGHT:
                playerX_change = 2


            if event.key == pygame.K_SPACE:
                if bul_state == "ready":
                    bulXc = playerX
                    bull(bulXc, bulY)
        if event.type == pygame.KEYUP:
            if event.key == pygame.K_LEFT or event.key == pygame.K_RIGHT:
                playerX_change = 0
        if event.type == pygame.KEYDOWN:
            if event.key == pygame.K_UP or event.key == pygame.K_DOWN:
                playerY_change = 0


    playerX += playerX_change

    if playerX <= 0:
        playerX = 800
    elif playerX >= 800:
        playerX = 0
    for i in range(no_of_enymies):
        enyY[i] += enyxc[i]
        if enyY[i] >= 520:
            score -= 1
            enyX[i] = random.randint(0, 765)
            enyY[i] = random.randint(32, 400)

        colli = coll(enyX[i], enyY[i], bulXc, bulY)
        if colli and bulY !=535 :
            bul_state = "ready"
            bulY = 535
            score += 1
            print(score)
            enyX[i] = random.randint(0, 765)
            enyY[i] = random.randint(32, 400)
        eny(enyX[i], enyY[i],i)

    if bul_state == "fire":
        bull(bulXc, bulY)
        bulY -= bulYc
    if bulY <= 0:
            bul_state = "ready"
            bulY = 535


    player(playerX, playerY)
    set_score(tx,ty)
    pygame.display.update()