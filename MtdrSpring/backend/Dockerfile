FROM openjdk:22
#COPY pom.xml /tmp/
#COPY src /tmp/src/
WORKDIR /tmp/
EXPOSE 8080
COPY target/MyTodoList-0.0.1-SNAPSHOT.jar MyTodoList.jar
RUN mkdir -p /mtdworkshop/creds
COPY wallet/ /mtdworkshop/creds
ENV db_user="TODOUSER"
ENV dbpassword="None00010001"
ENV db_url="jdbc:oracle:thin:@ChisOpsTest_tp?TNS_ADMIN=/mtdrworkshop/creds"
ENV driver_class_name="oracle.jdbc.OracleDriver"
ENV _JAVA_OPTIONS=-Dlogging.level.org.springframework=INFO
ENTRYPOINT ["java","-jar","MyTodoList.jar"]