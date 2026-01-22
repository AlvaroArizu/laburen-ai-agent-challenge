DELETE FROM product_price_tiers;
DELETE FROM cart_items;
DELETE FROM carts;
DELETE FROM products;
INSERT INTO products (id,name,description,price,stock,tipo_prenda,talla,color,categoria,disponible)
VALUES (1,'Pantalón Verde XXL - Deportivo','Ideal para uso diario.',1058,177,'Pantalón','XXL','Verde','Deportivo',1);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (1,50,1058);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (1,100,1182);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (1,200,462);
INSERT INTO products (id,name,description,price,stock,tipo_prenda,talla,color,categoria,disponible)
VALUES (2,'Camiseta Blanco XXL - Deportivo','Prenda cómoda y ligera.',510,33,'Camiseta','XXL','Blanco','Deportivo',1);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (2,50,510);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (2,100,975);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (2,200,739);
INSERT INTO products (id,name,description,price,stock,tipo_prenda,talla,color,categoria,disponible)
VALUES (3,'Camiseta Negro S - Casual','Diseño moderno y elegante.',1292,457,'Camiseta','S','Negro','Casual',1);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (3,50,1292);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (3,100,457);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (3,200,873);
INSERT INTO products (id,name,description,price,stock,tipo_prenda,talla,color,categoria,disponible)
VALUES (4,'Falda Blanco S - Casual','Ideal para uso diario.',1138,414,'Falda','S','Blanco','Casual',1);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (4,50,1138);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (4,100,986);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (4,200,386);
INSERT INTO products (id,name,description,price,stock,tipo_prenda,talla,color,categoria,disponible)
VALUES (5,'Sudadera Verde XL - Formal','Diseño moderno y elegante.',603,151,'Sudadera','XL','Verde','Formal',1);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (5,50,603);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (5,100,799);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (5,200,367);
INSERT INTO products (id,name,description,price,stock,tipo_prenda,talla,color,categoria,disponible)
VALUES (6,'Chaqueta Amarillo S - Deportivo','Prenda cómoda y ligera.',961,223,'Chaqueta','S','Amarillo','Deportivo',1);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (6,50,961);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (6,100,636);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (6,200,1014);
INSERT INTO products (id,name,description,price,stock,tipo_prenda,talla,color,categoria,disponible)
VALUES (7,'Pantalón Gris L - Deportivo','Diseño moderno y elegante.',1331,436,'Pantalón','L','Gris','Deportivo',1);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (7,50,1331);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (7,100,1222);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (7,200,516);
INSERT INTO products (id,name,description,price,stock,tipo_prenda,talla,color,categoria,disponible)
VALUES (8,'Falda Blanco XXL - Casual','Prenda cómoda y ligera.',1286,441,'Falda','XXL','Blanco','Casual',1);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (8,50,1286);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (8,100,1306);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (8,200,613);
INSERT INTO products (id,name,description,price,stock,tipo_prenda,talla,color,categoria,disponible)
VALUES (9,'Sudadera Azul L - Casual','Material de alta calidad.',889,187,'Sudadera','L','Azul','Casual',1);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (9,50,889);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (9,100,991);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (9,200,608);
INSERT INTO products (id,name,description,price,stock,tipo_prenda,talla,color,categoria,disponible)
VALUES (10,'Pantalón Gris XXL - Formal','Diseño moderno y elegante.',647,462,'Pantalón','XXL','Gris','Formal',1);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (10,50,647);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (10,100,1149);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (10,200,542);
INSERT INTO products (id,name,description,price,stock,tipo_prenda,talla,color,categoria,disponible)
VALUES (11,'Chaqueta Azul S - Deportivo','Material de alta calidad.',464,65,'Chaqueta','S','Azul','Deportivo',1);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (11,50,464);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (11,100,1109);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (11,200,555);
INSERT INTO products (id,name,description,price,stock,tipo_prenda,talla,color,categoria,disponible)
VALUES (12,'Pantalón Blanco M - Formal','Material de alta calidad.',786,65,'Pantalón','M','Blanco','Formal',1);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (12,50,786);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (12,100,941);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (12,200,640);
INSERT INTO products (id,name,description,price,stock,tipo_prenda,talla,color,categoria,disponible)
VALUES (13,'Falda Azul XL - Deportivo','Material de alta calidad.',762,454,'Falda','XL','Azul','Deportivo',1);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (13,50,762);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (13,100,1123);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (13,200,898);
INSERT INTO products (id,name,description,price,stock,tipo_prenda,talla,color,categoria,disponible)
VALUES (14,'Chaqueta Gris L - Casual','Diseño moderno y elegante.',430,193,'Chaqueta','L','Gris','Casual',1);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (14,50,430);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (14,100,903);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (14,200,940);
INSERT INTO products (id,name,description,price,stock,tipo_prenda,talla,color,categoria,disponible)
VALUES (15,'Falda Azul L - Deportivo','Prenda cómoda y ligera.',952,246,'Falda','L','Azul','Deportivo',1);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (15,50,952);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (15,100,530);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (15,200,1107);
INSERT INTO products (id,name,description,price,stock,tipo_prenda,talla,color,categoria,disponible)
VALUES (16,'Falda Blanco XL - Formal','Prenda cómoda y ligera.',883,301,'Falda','XL','Blanco','Formal',0);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (16,50,883);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (16,100,693);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (16,200,615);
INSERT INTO products (id,name,description,price,stock,tipo_prenda,talla,color,categoria,disponible)
VALUES (17,'Camiseta Azul S - Deportivo','Material de alta calidad.',1128,348,'Camiseta','S','Azul','Deportivo',1);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (17,50,1128);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (17,100,1351);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (17,200,737);
INSERT INTO products (id,name,description,price,stock,tipo_prenda,talla,color,categoria,disponible)
VALUES (18,'Falda Gris L - Deportivo','Prenda cómoda y ligera.',1224,39,'Falda','L','Gris','Deportivo',0);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (18,50,1224);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (18,100,1394);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (18,200,763);
INSERT INTO products (id,name,description,price,stock,tipo_prenda,talla,color,categoria,disponible)
VALUES (19,'Chaqueta Azul L - Formal','Prenda cómoda y ligera.',416,86,'Chaqueta','L','Azul','Formal',0);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (19,50,416);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (19,100,939);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (19,200,382);
INSERT INTO products (id,name,description,price,stock,tipo_prenda,talla,color,categoria,disponible)
VALUES (20,'Camiseta Rojo XXL - Deportivo','Diseño moderno y elegante.',1292,302,'Camiseta','XXL','Rojo','Deportivo',1);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (20,50,1292);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (20,100,962);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (20,200,816);
INSERT INTO products (id,name,description,price,stock,tipo_prenda,talla,color,categoria,disponible)
VALUES (21,'Pantalón Verde L - Formal','Material de alta calidad.',1017,334,'Pantalón','L','Verde','Formal',1);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (21,50,1017);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (21,100,639);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (21,200,1238);
INSERT INTO products (id,name,description,price,stock,tipo_prenda,talla,color,categoria,disponible)
VALUES (22,'Sudadera Azul XL - Deportivo','Diseño moderno y elegante.',1288,350,'Sudadera','XL','Azul','Deportivo',0);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (22,50,1288);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (22,100,1339);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (22,200,547);
INSERT INTO products (id,name,description,price,stock,tipo_prenda,talla,color,categoria,disponible)
VALUES (23,'Pantalón Verde S - Casual','Prenda cómoda y ligera.',525,257,'Pantalón','S','Verde','Casual',1);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (23,50,525);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (23,100,544);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (23,200,1205);
INSERT INTO products (id,name,description,price,stock,tipo_prenda,talla,color,categoria,disponible)
VALUES (24,'Camiseta Negro M - Formal','Diseño moderno y elegante.',1386,34,'Camiseta','M','Negro','Formal',0);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (24,50,1386);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (24,100,643);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (24,200,1131);
INSERT INTO products (id,name,description,price,stock,tipo_prenda,talla,color,categoria,disponible)
VALUES (25,'Sudadera Negro S - Deportivo','Perfecta para actividades al aire libre.',596,166,'Sudadera','S','Negro','Deportivo',1);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (25,50,596);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (25,100,1276);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (25,200,791);
INSERT INTO products (id,name,description,price,stock,tipo_prenda,talla,color,categoria,disponible)
VALUES (26,'Camiseta Verde S - Casual','Material de alta calidad.',503,214,'Camiseta','S','Verde','Casual',0);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (26,50,503);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (26,100,385);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (26,200,858);
INSERT INTO products (id,name,description,price,stock,tipo_prenda,talla,color,categoria,disponible)
VALUES (27,'Sudadera Verde S - Casual','Ideal para uso diario.',967,64,'Sudadera','S','Verde','Casual',1);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (27,50,967);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (27,100,724);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (27,200,768);
INSERT INTO products (id,name,description,price,stock,tipo_prenda,talla,color,categoria,disponible)
VALUES (28,'Falda Negro XL - Deportivo','Perfecta para actividades al aire libre.',464,196,'Falda','XL','Negro','Deportivo',1);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (28,50,464);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (28,100,1368);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (28,200,711);
INSERT INTO products (id,name,description,price,stock,tipo_prenda,talla,color,categoria,disponible)
VALUES (29,'Chaqueta Amarillo XL - Casual','Diseño moderno y elegante.',1465,282,'Chaqueta','XL','Amarillo','Casual',1);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (29,50,1465);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (29,100,1069);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (29,200,464);
INSERT INTO products (id,name,description,price,stock,tipo_prenda,talla,color,categoria,disponible)
VALUES (30,'Camisa Verde M - Casual','Ideal para uso diario.',1100,206,'Camisa','M','Verde','Casual',1);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (30,50,1100);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (30,100,842);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (30,200,572);
INSERT INTO products (id,name,description,price,stock,tipo_prenda,talla,color,categoria,disponible)
VALUES (31,'Falda Blanco XXL - Casual','Prenda cómoda y ligera.',1006,322,'Falda','XXL','Blanco','Casual',0);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (31,50,1006);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (31,100,1017);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (31,200,1065);
INSERT INTO products (id,name,description,price,stock,tipo_prenda,talla,color,categoria,disponible)
VALUES (32,'Camiseta Rojo S - Deportivo','Perfecta para actividades al aire libre.',1010,298,'Camiseta','S','Rojo','Deportivo',1);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (32,50,1010);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (32,100,743);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (32,200,431);
INSERT INTO products (id,name,description,price,stock,tipo_prenda,talla,color,categoria,disponible)
VALUES (33,'Falda Azul M - Deportivo','Diseño moderno y elegante.',1120,482,'Falda','M','Azul','Deportivo',1);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (33,50,1120);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (33,100,765);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (33,200,400);
INSERT INTO products (id,name,description,price,stock,tipo_prenda,talla,color,categoria,disponible)
VALUES (34,'Camisa Blanco L - Formal','Ideal para uso diario.',548,40,'Camisa','L','Blanco','Formal',0);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (34,50,548);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (34,100,761);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (34,200,685);
INSERT INTO products (id,name,description,price,stock,tipo_prenda,talla,color,categoria,disponible)
VALUES (35,'Camisa Verde XXL - Deportivo','Diseño moderno y elegante.',783,264,'Camisa','XXL','Verde','Deportivo',1);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (35,50,783);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (35,100,771);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (35,200,1035);
INSERT INTO products (id,name,description,price,stock,tipo_prenda,talla,color,categoria,disponible)
VALUES (36,'Sudadera Amarillo XXL - Deportivo','Material de alta calidad.',1261,194,'Sudadera','XXL','Amarillo','Deportivo',1);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (36,50,1261);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (36,100,479);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (36,200,310);
INSERT INTO products (id,name,description,price,stock,tipo_prenda,talla,color,categoria,disponible)
VALUES (37,'Sudadera Negro S - Formal','Ideal para uso diario.',925,208,'Sudadera','S','Negro','Formal',1);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (37,50,925);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (37,100,938);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (37,200,1270);
INSERT INTO products (id,name,description,price,stock,tipo_prenda,talla,color,categoria,disponible)
VALUES (38,'Pantalón Rojo XXL - Formal','Material de alta calidad.',1379,19,'Pantalón','XXL','Rojo','Formal',1);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (38,50,1379);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (38,100,539);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (38,200,913);
INSERT INTO products (id,name,description,price,stock,tipo_prenda,talla,color,categoria,disponible)
VALUES (39,'Pantalón Verde M - Casual','Diseño moderno y elegante.',1338,340,'Pantalón','M','Verde','Casual',1);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (39,50,1338);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (39,100,449);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (39,200,406);
INSERT INTO products (id,name,description,price,stock,tipo_prenda,talla,color,categoria,disponible)
VALUES (40,'Pantalón Negro M - Casual','Prenda cómoda y ligera.',1295,199,'Pantalón','M','Negro','Casual',0);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (40,50,1295);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (40,100,713);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (40,200,680);
INSERT INTO products (id,name,description,price,stock,tipo_prenda,talla,color,categoria,disponible)
VALUES (41,'Chaqueta Rojo M - Deportivo','Material de alta calidad.',777,142,'Chaqueta','M','Rojo','Deportivo',1);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (41,50,777);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (41,100,1083);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (41,200,702);
INSERT INTO products (id,name,description,price,stock,tipo_prenda,talla,color,categoria,disponible)
VALUES (42,'Chaqueta Amarillo S - Casual','Diseño moderno y elegante.',1089,333,'Chaqueta','S','Amarillo','Casual',1);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (42,50,1089);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (42,100,438);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (42,200,567);
INSERT INTO products (id,name,description,price,stock,tipo_prenda,talla,color,categoria,disponible)
VALUES (43,'Sudadera Rojo XXL - Formal','Perfecta para actividades al aire libre.',1271,304,'Sudadera','XXL','Rojo','Formal',1);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (43,50,1271);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (43,100,559);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (43,200,1221);
INSERT INTO products (id,name,description,price,stock,tipo_prenda,talla,color,categoria,disponible)
VALUES (44,'Camiseta Azul S - Deportivo','Diseño moderno y elegante.',424,443,'Camiseta','S','Azul','Deportivo',1);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (44,50,424);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (44,100,1046);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (44,200,382);
INSERT INTO products (id,name,description,price,stock,tipo_prenda,talla,color,categoria,disponible)
VALUES (45,'Sudadera Rojo XL - Deportivo','Material de alta calidad.',840,376,'Sudadera','XL','Rojo','Deportivo',1);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (45,50,840);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (45,100,1152);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (45,200,1270);
INSERT INTO products (id,name,description,price,stock,tipo_prenda,talla,color,categoria,disponible)
VALUES (46,'Camisa Rojo S - Formal','Perfecta para actividades al aire libre.',1090,121,'Camisa','S','Rojo','Formal',1);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (46,50,1090);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (46,100,818);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (46,200,986);
INSERT INTO products (id,name,description,price,stock,tipo_prenda,talla,color,categoria,disponible)
VALUES (47,'Chaqueta Blanco XL - Formal','Ideal para uso diario.',608,279,'Chaqueta','XL','Blanco','Formal',0);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (47,50,608);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (47,100,748);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (47,200,644);
INSERT INTO products (id,name,description,price,stock,tipo_prenda,talla,color,categoria,disponible)
VALUES (48,'Camiseta Amarillo XXL - Formal','Ideal para uso diario.',548,480,'Camiseta','XXL','Amarillo','Formal',1);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (48,50,548);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (48,100,880);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (48,200,1278);
INSERT INTO products (id,name,description,price,stock,tipo_prenda,talla,color,categoria,disponible)
VALUES (49,'Sudadera Blanco XL - Deportivo','Ideal para uso diario.',1167,262,'Sudadera','XL','Blanco','Deportivo',0);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (49,50,1167);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (49,100,714);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (49,200,792);
INSERT INTO products (id,name,description,price,stock,tipo_prenda,talla,color,categoria,disponible)
VALUES (50,'Sudadera Blanco XL - Deportivo','Ideal para uso diario.',717,248,'Sudadera','XL','Blanco','Deportivo',1);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (50,50,717);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (50,100,590);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (50,200,865);
INSERT INTO products (id,name,description,price,stock,tipo_prenda,talla,color,categoria,disponible)
VALUES (51,'Falda Blanco M - Casual','Diseño moderno y elegante.',1071,323,'Falda','M','Blanco','Casual',1);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (51,50,1071);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (51,100,583);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (51,200,831);
INSERT INTO products (id,name,description,price,stock,tipo_prenda,talla,color,categoria,disponible)
VALUES (52,'Camisa Gris XXL - Casual','Material de alta calidad.',963,411,'Camisa','XXL','Gris','Casual',0);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (52,50,963);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (52,100,673);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (52,200,689);
INSERT INTO products (id,name,description,price,stock,tipo_prenda,talla,color,categoria,disponible)
VALUES (53,'Pantalón Azul XL - Deportivo','Diseño moderno y elegante.',815,405,'Pantalón','XL','Azul','Deportivo',1);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (53,50,815);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (53,100,1187);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (53,200,703);
INSERT INTO products (id,name,description,price,stock,tipo_prenda,talla,color,categoria,disponible)
VALUES (54,'Falda Azul L - Deportivo','Prenda cómoda y ligera.',805,41,'Falda','L','Azul','Deportivo',0);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (54,50,805);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (54,100,740);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (54,200,986);
INSERT INTO products (id,name,description,price,stock,tipo_prenda,talla,color,categoria,disponible)
VALUES (55,'Camisa Blanco L - Casual','Diseño moderno y elegante.',551,111,'Camisa','L','Blanco','Casual',1);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (55,50,551);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (55,100,1055);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (55,200,921);
INSERT INTO products (id,name,description,price,stock,tipo_prenda,talla,color,categoria,disponible)
VALUES (56,'Chaqueta Negro XL - Formal','Perfecta para actividades al aire libre.',876,73,'Chaqueta','XL','Negro','Formal',0);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (56,50,876);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (56,100,1056);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (56,200,770);
INSERT INTO products (id,name,description,price,stock,tipo_prenda,talla,color,categoria,disponible)
VALUES (57,'Camiseta Rojo S - Casual','Diseño moderno y elegante.',1049,37,'Camiseta','S','Rojo','Casual',1);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (57,50,1049);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (57,100,573);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (57,200,356);
INSERT INTO products (id,name,description,price,stock,tipo_prenda,talla,color,categoria,disponible)
VALUES (58,'Camisa Rojo M - Casual','Diseño moderno y elegante.',655,151,'Camisa','M','Rojo','Casual',0);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (58,50,655);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (58,100,730);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (58,200,562);
INSERT INTO products (id,name,description,price,stock,tipo_prenda,talla,color,categoria,disponible)
VALUES (59,'Chaqueta Gris XL - Deportivo','Ideal para uso diario.',1052,260,'Chaqueta','XL','Gris','Deportivo',1);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (59,50,1052);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (59,100,368);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (59,200,452);
INSERT INTO products (id,name,description,price,stock,tipo_prenda,talla,color,categoria,disponible)
VALUES (60,'Pantalón Verde M - Deportivo','Perfecta para actividades al aire libre.',960,405,'Pantalón','M','Verde','Deportivo',1);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (60,50,960);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (60,100,1164);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (60,200,360);
INSERT INTO products (id,name,description,price,stock,tipo_prenda,talla,color,categoria,disponible)
VALUES (61,'Chaqueta Negro XXL - Formal','Material de alta calidad.',1055,297,'Chaqueta','XXL','Negro','Formal',1);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (61,50,1055);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (61,100,570);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (61,200,1021);
INSERT INTO products (id,name,description,price,stock,tipo_prenda,talla,color,categoria,disponible)
VALUES (62,'Chaqueta Verde S - Formal','Perfecta para actividades al aire libre.',1180,473,'Chaqueta','S','Verde','Formal',1);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (62,50,1180);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (62,100,769);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (62,200,482);
INSERT INTO products (id,name,description,price,stock,tipo_prenda,talla,color,categoria,disponible)
VALUES (63,'Pantalón Rojo L - Casual','Prenda cómoda y ligera.',708,11,'Pantalón','L','Rojo','Casual',0);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (63,50,708);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (63,100,945);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (63,200,654);
INSERT INTO products (id,name,description,price,stock,tipo_prenda,talla,color,categoria,disponible)
VALUES (64,'Falda Gris M - Deportivo','Material de alta calidad.',874,374,'Falda','M','Gris','Deportivo',1);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (64,50,874);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (64,100,993);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (64,200,766);
INSERT INTO products (id,name,description,price,stock,tipo_prenda,talla,color,categoria,disponible)
VALUES (65,'Falda Verde L - Casual','Ideal para uso diario.',685,137,'Falda','L','Verde','Casual',0);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (65,50,685);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (65,100,386);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (65,200,1018);
INSERT INTO products (id,name,description,price,stock,tipo_prenda,talla,color,categoria,disponible)
VALUES (66,'Camisa Azul XL - Deportivo','Perfecta para actividades al aire libre.',1151,441,'Camisa','XL','Azul','Deportivo',1);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (66,50,1151);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (66,100,422);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (66,200,621);
INSERT INTO products (id,name,description,price,stock,tipo_prenda,talla,color,categoria,disponible)
VALUES (67,'Pantalón Azul XL - Deportivo','Material de alta calidad.',1331,17,'Pantalón','XL','Azul','Deportivo',0);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (67,50,1331);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (67,100,1225);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (67,200,704);
INSERT INTO products (id,name,description,price,stock,tipo_prenda,talla,color,categoria,disponible)
VALUES (68,'Sudadera Blanco S - Deportivo','Diseño moderno y elegante.',571,479,'Sudadera','S','Blanco','Deportivo',0);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (68,50,571);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (68,100,1081);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (68,200,1170);
INSERT INTO products (id,name,description,price,stock,tipo_prenda,talla,color,categoria,disponible)
VALUES (69,'Camisa Negro L - Deportivo','Ideal para uso diario.',835,486,'Camisa','L','Negro','Deportivo',1);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (69,50,835);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (69,100,1207);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (69,200,911);
INSERT INTO products (id,name,description,price,stock,tipo_prenda,talla,color,categoria,disponible)
VALUES (70,'Camiseta Rojo XL - Casual','Perfecta para actividades al aire libre.',1225,364,'Camiseta','XL','Rojo','Casual',0);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (70,50,1225);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (70,100,1248);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (70,200,358);
INSERT INTO products (id,name,description,price,stock,tipo_prenda,talla,color,categoria,disponible)
VALUES (71,'Chaqueta Blanco L - Casual','Ideal para uso diario.',1070,320,'Chaqueta','L','Blanco','Casual',1);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (71,50,1070);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (71,100,1281);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (71,200,1014);
INSERT INTO products (id,name,description,price,stock,tipo_prenda,talla,color,categoria,disponible)
VALUES (72,'Camiseta Amarillo L - Casual','Diseño moderno y elegante.',1356,148,'Camiseta','L','Amarillo','Casual',1);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (72,50,1356);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (72,100,974);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (72,200,699);
INSERT INTO products (id,name,description,price,stock,tipo_prenda,talla,color,categoria,disponible)
VALUES (73,'Falda Gris L - Deportivo','Material de alta calidad.',1283,252,'Falda','L','Gris','Deportivo',1);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (73,50,1283);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (73,100,1190);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (73,200,433);
INSERT INTO products (id,name,description,price,stock,tipo_prenda,talla,color,categoria,disponible)
VALUES (74,'Pantalón Rojo XL - Deportivo','Perfecta para actividades al aire libre.',913,28,'Pantalón','XL','Rojo','Deportivo',0);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (74,50,913);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (74,100,1058);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (74,200,334);
INSERT INTO products (id,name,description,price,stock,tipo_prenda,talla,color,categoria,disponible)
VALUES (75,'Chaqueta Verde S - Formal','Ideal para uso diario.',507,136,'Chaqueta','S','Verde','Formal',1);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (75,50,507);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (75,100,521);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (75,200,1207);
INSERT INTO products (id,name,description,price,stock,tipo_prenda,talla,color,categoria,disponible)
VALUES (76,'Chaqueta Azul L - Casual','Perfecta para actividades al aire libre.',407,18,'Chaqueta','L','Azul','Casual',1);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (76,50,407);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (76,100,641);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (76,200,1259);
INSERT INTO products (id,name,description,price,stock,tipo_prenda,talla,color,categoria,disponible)
VALUES (77,'Sudadera Gris XL - Formal','Diseño moderno y elegante.',516,453,'Sudadera','XL','Gris','Formal',0);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (77,50,516);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (77,100,520);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (77,200,951);
INSERT INTO products (id,name,description,price,stock,tipo_prenda,talla,color,categoria,disponible)
VALUES (78,'Camiseta Gris M - Formal','Prenda cómoda y ligera.',457,360,'Camiseta','M','Gris','Formal',1);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (78,50,457);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (78,100,959);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (78,200,1148);
INSERT INTO products (id,name,description,price,stock,tipo_prenda,talla,color,categoria,disponible)
VALUES (79,'Camiseta Blanco L - Deportivo','Ideal para uso diario.',445,103,'Camiseta','L','Blanco','Deportivo',1);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (79,50,445);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (79,100,1191);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (79,200,812);
INSERT INTO products (id,name,description,price,stock,tipo_prenda,talla,color,categoria,disponible)
VALUES (80,'Falda Verde S - Deportivo','Prenda cómoda y ligera.',680,200,'Falda','S','Verde','Deportivo',0);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (80,50,680);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (80,100,965);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (80,200,875);
INSERT INTO products (id,name,description,price,stock,tipo_prenda,talla,color,categoria,disponible)
VALUES (81,'Sudadera Negro M - Casual','Diseño moderno y elegante.',1008,319,'Sudadera','M','Negro','Casual',1);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (81,50,1008);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (81,100,1071);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (81,200,1212);
INSERT INTO products (id,name,description,price,stock,tipo_prenda,talla,color,categoria,disponible)
VALUES (82,'Pantalón Rojo M - Formal','Diseño moderno y elegante.',720,337,'Pantalón','M','Rojo','Formal',0);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (82,50,720);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (82,100,1389);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (82,200,431);
INSERT INTO products (id,name,description,price,stock,tipo_prenda,talla,color,categoria,disponible)
VALUES (83,'Sudadera Azul XXL - Casual','Material de alta calidad.',801,275,'Sudadera','XXL','Azul','Casual',0);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (83,50,801);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (83,100,780);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (83,200,1221);
INSERT INTO products (id,name,description,price,stock,tipo_prenda,talla,color,categoria,disponible)
VALUES (84,'Sudadera Rojo XXL - Casual','Perfecta para actividades al aire libre.',1167,218,'Sudadera','XXL','Rojo','Casual',1);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (84,50,1167);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (84,100,674);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (84,200,1263);
INSERT INTO products (id,name,description,price,stock,tipo_prenda,talla,color,categoria,disponible)
VALUES (85,'Camisa Rojo M - Casual','Material de alta calidad.',527,19,'Camisa','M','Rojo','Casual',1);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (85,50,527);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (85,100,822);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (85,200,791);
INSERT INTO products (id,name,description,price,stock,tipo_prenda,talla,color,categoria,disponible)
VALUES (86,'Pantalón Gris S - Casual','Perfecta para actividades al aire libre.',753,99,'Pantalón','S','Gris','Casual',0);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (86,50,753);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (86,100,731);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (86,200,347);
INSERT INTO products (id,name,description,price,stock,tipo_prenda,talla,color,categoria,disponible)
VALUES (87,'Falda Verde L - Casual','Ideal para uso diario.',1390,317,'Falda','L','Verde','Casual',1);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (87,50,1390);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (87,100,971);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (87,200,1123);
INSERT INTO products (id,name,description,price,stock,tipo_prenda,talla,color,categoria,disponible)
VALUES (88,'Camisa Azul M - Casual','Material de alta calidad.',1438,253,'Camisa','M','Azul','Casual',1);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (88,50,1438);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (88,100,1342);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (88,200,1009);
INSERT INTO products (id,name,description,price,stock,tipo_prenda,talla,color,categoria,disponible)
VALUES (89,'Camiseta Verde L - Formal','Perfecta para actividades al aire libre.',778,449,'Camiseta','L','Verde','Formal',1);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (89,50,778);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (89,100,1177);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (89,200,977);
INSERT INTO products (id,name,description,price,stock,tipo_prenda,talla,color,categoria,disponible)
VALUES (90,'Camiseta Verde M - Formal','Perfecta para actividades al aire libre.',404,350,'Camiseta','M','Verde','Formal',1);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (90,50,404);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (90,100,1221);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (90,200,1012);
INSERT INTO products (id,name,description,price,stock,tipo_prenda,talla,color,categoria,disponible)
VALUES (91,'Chaqueta Amarillo XXL - Deportivo','Diseño moderno y elegante.',463,98,'Chaqueta','XXL','Amarillo','Deportivo',0);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (91,50,463);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (91,100,580);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (91,200,1271);
INSERT INTO products (id,name,description,price,stock,tipo_prenda,talla,color,categoria,disponible)
VALUES (92,'Camiseta Gris S - Casual','Ideal para uso diario.',987,226,'Camiseta','S','Gris','Casual',1);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (92,50,987);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (92,100,490);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (92,200,904);
INSERT INTO products (id,name,description,price,stock,tipo_prenda,talla,color,categoria,disponible)
VALUES (93,'Camiseta Blanco L - Deportivo','Material de alta calidad.',599,100,'Camiseta','L','Blanco','Deportivo',1);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (93,50,599);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (93,100,1336);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (93,200,1246);
INSERT INTO products (id,name,description,price,stock,tipo_prenda,talla,color,categoria,disponible)
VALUES (94,'Pantalón Gris XL - Casual','Diseño moderno y elegante.',756,249,'Pantalón','XL','Gris','Casual',1);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (94,50,756);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (94,100,1288);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (94,200,425);
INSERT INTO products (id,name,description,price,stock,tipo_prenda,talla,color,categoria,disponible)
VALUES (95,'Camiseta Negro XL - Formal','Perfecta para actividades al aire libre.',541,245,'Camiseta','XL','Negro','Formal',1);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (95,50,541);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (95,100,1095);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (95,200,681);
INSERT INTO products (id,name,description,price,stock,tipo_prenda,talla,color,categoria,disponible)
VALUES (96,'Falda Negro L - Deportivo','Prenda cómoda y ligera.',975,480,'Falda','L','Negro','Deportivo',1);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (96,50,975);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (96,100,457);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (96,200,798);
INSERT INTO products (id,name,description,price,stock,tipo_prenda,talla,color,categoria,disponible)
VALUES (97,'Falda Azul XXL - Formal','Perfecta para actividades al aire libre.',973,51,'Falda','XXL','Azul','Formal',1);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (97,50,973);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (97,100,785);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (97,200,628);
INSERT INTO products (id,name,description,price,stock,tipo_prenda,talla,color,categoria,disponible)
VALUES (98,'Sudadera Azul XXL - Casual','Perfecta para actividades al aire libre.',1491,114,'Sudadera','XXL','Azul','Casual',1);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (98,50,1491);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (98,100,529);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (98,200,476);
INSERT INTO products (id,name,description,price,stock,tipo_prenda,talla,color,categoria,disponible)
VALUES (99,'Camiseta Verde S - Formal','Ideal para uso diario.',1067,391,'Camiseta','S','Verde','Formal',1);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (99,50,1067);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (99,100,372);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (99,200,366);
INSERT INTO products (id,name,description,price,stock,tipo_prenda,talla,color,categoria,disponible)
VALUES (100,'Chaqueta Rojo XL - Deportivo','Diseño moderno y elegante.',1117,347,'Chaqueta','XL','Rojo','Deportivo',1);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (100,50,1117);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (100,100,565);
INSERT INTO product_price_tiers (product_id,min_qty,price) VALUES (100,200,358);
