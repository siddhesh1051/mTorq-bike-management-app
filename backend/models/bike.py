from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from enum import Enum


class BikeBrand(str, Enum):
    ROYAL_ENFIELD = "Royal Enfield"
    HARLEY_DAVIDSON = "Harley-Davidson"
    TRIUMPH = "Triumph"
    KTM = "KTM"
    BMW = "BMW"
    DUCATI = "Ducati"
    KAWASAKI = "Kawasaki"
    HONDA = "Honda"
    YAMAHA = "Yamaha"
    SUZUKI = "Suzuki"
    BAJAJ = "Bajaj"
    TVS = "TVS"
    HERO = "Hero"
    JAWA = "Jawa"
    YEZDI = "Yezdi"
    BENELLI = "Benelli"
    APRILIA = "Aprilia"
    HUSQVARNA = "Husqvarna"
    OTHER = "Other"


class BikeModel(str, Enum):
    # Royal Enfield
    CLASSIC_350 = "Classic 350"
    CLASSIC_500 = "Classic 500"
    BULLET_350 = "Bullet 350"
    METEOR_350 = "Meteor 350"
    HUNTER_350 = "Hunter 350"
    SCRAM_440 = "Scram 440"
    HIMALAYAN = "Himalayan"
    INTERCEPTOR_650 = "Interceptor 650"
    CONTINENTAL_GT_650 = "Continental GT 650"
    SUPER_METEOR_650 = "Super Meteor 650"
    SHOTGUN_650 = "Shotgun 650"
    GUERRILLA_450 = "Guerrilla 450"
    
    # Harley-Davidson
    X440 = "X440"
    IRON_883 = "Iron 883"
    FORTY_EIGHT = "Forty-Eight"
    STREET_750 = "Street 750"
    FAT_BOY = "Fat Boy"
    SPORTSTER_S = "Sportster S"
    NIGHTSTER = "Nightster"
    PAN_AMERICA = "Pan America"
    
    # Triumph
    SPEED_T4 = "Speed T4"
    SPEED_400 = "Speed 400"
    SCRAMBLER_400_X = "Scrambler 400 X"
    TRIDENT_660 = "Trident 660"
    TIGER_900 = "Tiger 900"
    STREET_TRIPLE = "Street Triple"
    SPEED_TRIPLE = "Speed Triple"
    BONNEVILLE_T100 = "Bonneville T100"
    BONNEVILLE_T120 = "Bonneville T120"
    ROCKET_3 = "Rocket 3"
    
    # KTM
    DUKE_125 = "Duke 125"
    DUKE_200 = "Duke 200"
    DUKE_250 = "Duke 250"
    DUKE_390 = "Duke 390"
    RC_125 = "RC 125"
    RC_200 = "RC 200"
    RC_390 = "RC 390"
    ADVENTURE_250 = "Adventure 250"
    ADVENTURE_390 = "Adventure 390"
    
    # BMW
    G310R = "G 310 R"
    G310GS = "G 310 GS"
    S1000RR = "S 1000 RR"
    R1250GS = "R 1250 GS"
    F900R = "F 900 R"
    
    # Ducati
    PANIGALE_V2 = "Panigale V2"
    PANIGALE_V4 = "Panigale V4"
    MONSTER = "Monster"
    SCRAMBLER = "Scrambler"
    MULTISTRADA = "Multistrada"
    
    # Kawasaki
    NINJA_300 = "Ninja 300"
    NINJA_400 = "Ninja 400"
    NINJA_650 = "Ninja 650"
    NINJA_ZX10R = "Ninja ZX-10R"
    Z650 = "Z650"
    Z900 = "Z900"
    VERSYS_650 = "Versys 650"
    VULCAN_S = "Vulcan S"
    
    # Honda
    CB300R = "CB300R"
    CB350 = "CB350"
    CB350RS = "CB350RS"
    CB500X = "CB500X"
    AFRICA_TWIN = "Africa Twin"
    GOLDWING = "Gold Wing"
    HORNET_2_0 = "Hornet 2.0"
    SHINE = "Shine"
    UNICORN = "Unicorn"
    SP125 = "SP 125"
    ACTIVA = "Activa"
    
    # Yamaha
    R15_V4 = "R15 V4"
    R3 = "R3"
    MT15 = "MT-15"
    MT03 = "MT-03"
    FZ_S = "FZ-S"
    FZX = "FZX"
    AEROX_155 = "Aerox 155"
    FASCINO = "Fascino"
    RAY_ZR = "Ray ZR"
    
    # Suzuki
    GIXXER_SF = "Gixxer SF"
    GIXXER_250 = "Gixxer 250"
    V_STROM_250 = "V-Strom 250"
    HAYABUSA = "Hayabusa"
    ACCESS_125 = "Access 125"
    BURGMAN = "Burgman"
    
    # Bajaj
    PULSAR_NS200 = "Pulsar NS200"
    PULSAR_RS200 = "Pulsar RS200"
    PULSAR_N250 = "Pulsar N250"
    DOMINAR_250 = "Dominar 250"
    DOMINAR_400 = "Dominar 400"
    AVENGER = "Avenger"
    CHETAK = "Chetak"
    
    # TVS
    APACHE_RTR_160 = "Apache RTR 160"
    APACHE_RTR_200 = "Apache RTR 200"
    APACHE_RR310 = "Apache RR 310"
    RONIN = "Ronin"
    RAIDER = "Raider"
    JUPITER = "Jupiter"
    NTORQ = "NTorq"
    IQUBE = "iQube"
    
    # Hero
    XTREME_160R = "Xtreme 160R"
    XPULSE_200 = "XPulse 200"
    KARIZMA_XMR = "Karizma XMR"
    SPLENDOR = "Splendor"
    PASSION = "Passion"
    GLAMOUR = "Glamour"
    DESTINI = "Destini"
    
    # Jawa
    JAWA_350 = "Jawa 350"
    JAWA_42 = "42"
    PERAK = "Perak"
    
    # Yezdi
    ROADSTER = "Roadster"
    SCRAMBLER_YEZDI = "Scrambler"
    ADVENTURE = "Adventure"
    
    # Benelli
    IMPERIALE_400 = "Imperiale 400"
    LEONCINO_500 = "Leoncino 500"
    TRK_502 = "TRK 502"
    
    # Husqvarna
    SVARTPILEN_250 = "Svartpilen 250"
    VITPILEN_250 = "Vitpilen 250"
    SVARTPILEN_401 = "Svartpilen 401"
    
    # Aprilia
    RS_457 = "RS 457"
    TUONO_457 = "Tuono 457"
    SXR_160 = "SXR 160"
    
    OTHER = "Other"


# Mapping of brands to their models
BIKE_BRANDS_MODELS = {
    BikeBrand.ROYAL_ENFIELD: [
        BikeModel.CLASSIC_350, BikeModel.CLASSIC_500, BikeModel.BULLET_350,
        BikeModel.METEOR_350, BikeModel.HUNTER_350, BikeModel.SCRAM_440,
        BikeModel.HIMALAYAN, BikeModel.INTERCEPTOR_650, BikeModel.CONTINENTAL_GT_650,
        BikeModel.SUPER_METEOR_650, BikeModel.SHOTGUN_650, BikeModel.GUERRILLA_450
    ],
    BikeBrand.HARLEY_DAVIDSON: [
        BikeModel.X440, BikeModel.IRON_883, BikeModel.FORTY_EIGHT,
        BikeModel.STREET_750, BikeModel.FAT_BOY, BikeModel.SPORTSTER_S,
        BikeModel.NIGHTSTER, BikeModel.PAN_AMERICA
    ],
    BikeBrand.TRIUMPH: [
        BikeModel.SPEED_T4,
        BikeModel.SPEED_400, BikeModel.SCRAMBLER_400_X, BikeModel.TRIDENT_660,
        BikeModel.TIGER_900, BikeModel.STREET_TRIPLE, BikeModel.SPEED_TRIPLE,
        BikeModel.BONNEVILLE_T100, BikeModel.BONNEVILLE_T120, BikeModel.ROCKET_3
    ],
    BikeBrand.KTM: [
        BikeModel.DUKE_125, BikeModel.DUKE_200, BikeModel.DUKE_250,
        BikeModel.DUKE_390, BikeModel.RC_125, BikeModel.RC_200,
        BikeModel.RC_390, BikeModel.ADVENTURE_250, BikeModel.ADVENTURE_390
    ],
    BikeBrand.BMW: [
        BikeModel.G310R, BikeModel.G310GS, BikeModel.S1000RR,
        BikeModel.R1250GS, BikeModel.F900R
    ],
    BikeBrand.DUCATI: [
        BikeModel.PANIGALE_V2, BikeModel.PANIGALE_V4, BikeModel.MONSTER,
        BikeModel.SCRAMBLER, BikeModel.MULTISTRADA
    ],
    BikeBrand.KAWASAKI: [
        BikeModel.NINJA_300, BikeModel.NINJA_400, BikeModel.NINJA_650,
        BikeModel.NINJA_ZX10R, BikeModel.Z650, BikeModel.Z900,
        BikeModel.VERSYS_650, BikeModel.VULCAN_S
    ],
    BikeBrand.HONDA: [
        BikeModel.CB300R, BikeModel.CB350, BikeModel.CB350RS,
        BikeModel.CB500X, BikeModel.AFRICA_TWIN, BikeModel.GOLDWING,
        BikeModel.HORNET_2_0, BikeModel.SHINE, BikeModel.UNICORN,
        BikeModel.SP125, BikeModel.ACTIVA
    ],
    BikeBrand.YAMAHA: [
        BikeModel.R15_V4, BikeModel.R3, BikeModel.MT15, BikeModel.MT03,
        BikeModel.FZ_S, BikeModel.FZX, BikeModel.AEROX_155,
        BikeModel.FASCINO, BikeModel.RAY_ZR
    ],
    BikeBrand.SUZUKI: [
        BikeModel.GIXXER_SF, BikeModel.GIXXER_250, BikeModel.V_STROM_250,
        BikeModel.HAYABUSA, BikeModel.ACCESS_125, BikeModel.BURGMAN
    ],
    BikeBrand.BAJAJ: [
        BikeModel.PULSAR_NS200, BikeModel.PULSAR_RS200, BikeModel.PULSAR_N250,
        BikeModel.DOMINAR_250, BikeModel.DOMINAR_400, BikeModel.AVENGER,
        BikeModel.CHETAK
    ],
    BikeBrand.TVS: [
        BikeModel.APACHE_RTR_160, BikeModel.APACHE_RTR_200, BikeModel.APACHE_RR310,
        BikeModel.RONIN, BikeModel.RAIDER, BikeModel.JUPITER,
        BikeModel.NTORQ, BikeModel.IQUBE
    ],
    BikeBrand.HERO: [
        BikeModel.XTREME_160R, BikeModel.XPULSE_200, BikeModel.KARIZMA_XMR,
        BikeModel.SPLENDOR, BikeModel.PASSION, BikeModel.GLAMOUR, BikeModel.DESTINI
    ],
    BikeBrand.JAWA: [
        BikeModel.JAWA_350, BikeModel.JAWA_42, BikeModel.PERAK
    ],
    BikeBrand.YEZDI: [
        BikeModel.ROADSTER, BikeModel.SCRAMBLER_YEZDI, BikeModel.ADVENTURE
    ],
    BikeBrand.BENELLI: [
        BikeModel.IMPERIALE_400, BikeModel.LEONCINO_500, BikeModel.TRK_502
    ],
    BikeBrand.HUSQVARNA: [
        BikeModel.SVARTPILEN_250, BikeModel.VITPILEN_250, BikeModel.SVARTPILEN_401
    ],
    BikeBrand.APRILIA: [
        BikeModel.RS_457, BikeModel.TUONO_457, BikeModel.SXR_160
    ],
    BikeBrand.OTHER: [BikeModel.OTHER]
}


class BikeCreate(BaseModel):
    name: str
    brand: BikeBrand
    model: BikeModel
    registration: str


class BikeResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    user_id: str
    name: str
    brand: Optional[str] = None
    model: str
    registration: str
    created_at: str


class BikeUpdate(BaseModel):
    name: Optional[str] = None
    brand: Optional[BikeBrand] = None
    model: Optional[BikeModel] = None
    registration: Optional[str] = None
