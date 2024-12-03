import geopandas as gpd


shapefile_path = "boundaries_france_2020_SmallerArea.shp"
gdf = gpd.read_file(shapefile_path)


print("Initial GeoDataFrame:")
print(gdf.head())


crop_code_mapping = {
    "1": "BLE TENDRE",
    "2": "MAIS GRAIN ET ENSILAGE",
    "3": "ORGE",
    "4": "AUTRES CEREALES",
    "5": "COLZA",
    "6": "TOURNESOL",
    "7": "AUTRES OLEAGINEUX",
    "8": "PROTEAGINEUX",
    "9": "PLANTES A FIBRES",
    "10": "SEMENCES",
    "11": "GEL (SURFACES GELEES SANS PRODUCTION)",
    "12": "GEL INDUSTRIEL",
    "13": "AUTRES GELS",
    "14": "RIZ",
    "15": "LEGUMINEUSES A GRAINS",
    "16": "FOURRAGE",
    "17": "ESTIVES LANDES",
    "18": "PRAIRIES PERMANENTES",
    "19": "PRAIRIES TEMPORAIRES",
    "20": "VERGERS",
    "21": "VIGNES",
    "22": "FRUITS A COQUE",
    "23": "OLIVIERS",
    "24": "AUTRES CULTURES INDUSTRIELLES",
    "25": "LEGUMES - FLEURS",
    "26": "CANNE A SUCRE",
    "27": "ARBORICULTURE",
    "28": "DIVERS",
}

gdf["crop_label"] = gdf["crop_code_"].astype(str).map(crop_code_mapping)


print("Updated GeoDataFrame:")
print(gdf[["crop_code_", "crop_label"]].head())


gdf.to_file(shapefile_path, driver="ESRI Shapefile")
